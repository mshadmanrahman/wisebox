<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ConsultantTicketController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureConsultantScope($user);

        $baseQuery = $this->consultantBaseQuery($user);

        $stats = [
            'open_count' => (clone $baseQuery)->whereIn('status', ['open', 'assigned', 'in_progress'])->count(),
            'awaiting_customer_count' => (clone $baseQuery)->where('status', 'awaiting_customer')->count(),
            'upcoming_meetings_count' => (clone $baseQuery)
                ->whereNotNull('scheduled_at')
                ->whereBetween('scheduled_at', [now(), now()->addDays(7)])
                ->count(),
            'completed_this_month_count' => (clone $baseQuery)
                ->where('status', 'completed')
                ->whereBetween('resolved_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
        ];

        $upcoming = (clone $baseQuery)
            ->with(['customer:id,name,email', 'property:id,property_name'])
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'stats' => $stats,
                'upcoming_meetings' => $upcoming,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureConsultantScope($user);

        $query = $this->consultantBaseQuery($user)
            ->with(['property:id,property_name', 'service:id,name', 'customer:id,name,email', 'consultant:id,name,email'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->when($request->filled('priority'), fn ($q) => $q->where('priority', $request->string('priority')->toString()))
            ->latest();

        $tickets = $query->paginate($request->integer('per_page', 15));

        $stats = [
            'open_count' => (clone $this->consultantBaseQuery($user))->whereIn('status', ['open', 'assigned', 'in_progress'])->count(),
            'awaiting_customer_count' => (clone $this->consultantBaseQuery($user))->where('status', 'awaiting_customer')->count(),
            'scheduled_count' => (clone $this->consultantBaseQuery($user))->where('status', 'scheduled')->count(),
            'completed_count' => (clone $this->consultantBaseQuery($user))->where('status', 'completed')->count(),
        ];

        $paginated = $tickets->toArray();
        $paginated['stats'] = $stats;

        return response()->json($paginated);
    }

    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureConsultantScope($user);

        $days = max(1, min($request->integer('days', 30), 180));
        $rangeStart = now()->subDays($days);
        $baseQuery = $this->consultantBaseQuery($user);

        $statusBreakdown = (clone $baseQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $completedTickets = (clone $baseQuery)
            ->where('status', 'completed')
            ->whereNotNull('resolved_at')
            ->where('resolved_at', '>=', $rangeStart)
            ->get(['created_at', 'resolved_at']);

        $avgResolutionHours = $completedTickets->count() > 0
            ? round($completedTickets->avg(
                fn (Ticket $ticket) => (float) $ticket->resolved_at?->diffInMinutes($ticket->created_at) / 60
            ) ?? 0, 2)
            : null;

        $kpis = [
            'window_days' => $days,
            'active_count' => (clone $baseQuery)->whereIn('status', ['open', 'assigned', 'in_progress', 'awaiting_customer', 'awaiting_consultant', 'scheduled'])->count(),
            'completed_in_window_count' => $completedTickets->count(),
            'awaiting_customer_count' => (clone $baseQuery)->where('status', 'awaiting_customer')->count(),
            'upcoming_meetings_count' => (clone $baseQuery)
                ->whereNotNull('scheduled_at')
                ->whereBetween('scheduled_at', [now(), now()->addDays(7)])
                ->count(),
            'avg_resolution_hours' => $avgResolutionHours,
        ];

        if ($user->isConsultant()) {
            $maxConcurrent = max((int) ($user->consultantProfile?->max_concurrent_tickets ?? 10), 1);
            $openTickets = (clone $baseQuery)->whereNotIn('status', ['completed', 'cancelled'])->count();
            $kpis['capacity'] = [
                'open_tickets_count' => $openTickets,
                'max_concurrent_tickets' => $maxConcurrent,
                'utilization_percentage' => round(($openTickets / $maxConcurrent) * 100, 1),
            ];
        }

        return response()->json([
            'data' => [
                'kpis' => $kpis,
                'status_breakdown' => $statusBreakdown,
            ],
        ]);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $ticket->load([
            'order',
            'service',
            'customer:id,name,email,phone,country_of_residence',
            'consultant:id,name,email',
            'property.propertyType',
            'property.ownershipStatus',
            'property.ownershipType',
            'property.division',
            'property.district',
            'property.upazila',
            'property.mouza',
            'property.documents.documentType',
            'property.assessments',
            'comments.user:id,name,email',
        ]);

        return response()->json(['data' => $ticket]);
    }

    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $validated = $request->validate([
            'status' => [
                'sometimes',
                Rule::in(['open', 'assigned', 'in_progress', 'awaiting_customer', 'awaiting_consultant', 'scheduled', 'completed', 'cancelled']),
            ],
            'meeting_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'scheduled_at' => ['sometimes', 'nullable', 'date'],
            'meeting_duration_minutes' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:480'],
            'resolution_notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $ticket->fill($validated);

        if (($validated['status'] ?? null) === 'completed') {
            $ticket->resolved_at = now();
        }

        if (array_key_exists('status', $validated) && $validated['status'] !== 'completed') {
            $ticket->resolved_at = null;
        }

        $ticket->save();
        $ticket->load(['customer:id,name,email', 'consultant:id,name,email', 'property:id,property_name', 'service:id,name']);

        return response()->json(['data' => $ticket]);
    }

    public function addComment(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        $isInternal = (bool) ($validated['is_internal'] ?? false);

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'is_internal' => $isInternal,
        ]);

        if (!$isInternal && $ticket->status === 'awaiting_consultant') {
            $ticket->update(['status' => 'awaiting_customer']);
        }

        $comment->load('user:id,name,email');

        return response()->json(['data' => $comment], 201);
    }

    private function consultantBaseQuery(User $user)
    {
        return Ticket::query()
            ->when($user->isConsultant(), fn ($query) => $query->where('consultant_id', $user->id))
            ->when($user->isAdmin() && request()->filled('consultant_id'), fn ($query) => $query->where('consultant_id', request()->integer('consultant_id')));
    }

    private function ensureConsultantScope(User $user): void
    {
        abort_unless($user->isConsultant() || $user->isAdmin(), 403, 'Forbidden');
    }

    private function ensureCanAccessTicket(User $user, Ticket $ticket): void
    {
        $canAccess = $user->isAdmin() || ($user->isConsultant() && $ticket->consultant_id === $user->id);

        abort_unless($canAccess, 403, 'Forbidden');
    }
}
