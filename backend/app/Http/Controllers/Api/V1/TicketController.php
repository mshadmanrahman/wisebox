<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = Ticket::query()
            ->with([
                'property:id,property_name',
                'service:id,name',
                'customer:id,name,email',
                'consultant:id,name,email',
            ])
            ->when($user->isCustomer(), fn ($query) => $query->where('customer_id', $user->id))
            ->when($user->isConsultant(), fn ($query) => $query->where('consultant_id', $user->id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('priority'), fn ($query) => $query->where('priority', $request->string('priority')->toString()))
            ->when(
                $request->string('assigned')->toString() === 'unassigned' && $user->isAdmin(),
                fn ($query) => $query->whereNull('consultant_id')
            )
            ->when(
                $request->string('assigned')->toString() === 'assigned' && $user->isAdmin(),
                fn ($query) => $query->whereNotNull('consultant_id')
            )
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'property_id' => ['required', Rule::exists('properties', 'id')],
            'service_id' => ['nullable', 'exists:services,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
        ]);

        $property = Property::findOrFail($validated['property_id']);

        if (!$user->isAdmin() && !$user->isConsultant() && $property->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ticket = Ticket::create([
            'ticket_number' => $this->generateTicketNumber(),
            'order_id' => null,
            'property_id' => $property->id,
            'customer_id' => $property->user_id,
            'consultant_id' => null,
            'service_id' => $validated['service_id'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
        ]);

        $ticket->load(['property', 'service', 'customer', 'consultant']);

        return response()->json(['data' => $ticket], 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$this->canViewTicket($user, $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ticket->load([
            'property',
            'service',
            'customer:id,name,email',
            'consultant:id,name,email',
        ]);

        $payload = $ticket->toArray();
        $payload['comments'] = $this->commentQueryFor($user, $ticket)->get()->toArray();

        return response()->json(['data' => $payload]);
    }

    public function updateStatus(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!($user->isAdmin() || ($user->isConsultant() && $ticket->consultant_id === $user->id))) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:open,assigned,in_progress,awaiting_customer,awaiting_consultant,scheduled,completed,cancelled',
            ],
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $ticket->status = $validated['status'];

        if ($validated['status'] === 'completed') {
            $ticket->resolved_at = now();
            $ticket->resolution_notes = $validated['resolution_notes'] ?? $ticket->resolution_notes;
        }

        if ($validated['status'] !== 'completed') {
            $ticket->resolved_at = null;
        }

        $ticket->save();
        $ticket->load(['property', 'service', 'consultant']);

        return response()->json(['data' => $ticket]);
    }

    public function assignConsultant(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'consultant_id' => [
                'required',
                Rule::exists('users', 'id')->where(
                    fn ($query) => $query->where('role', 'consultant')->where('status', 'active')
                ),
            ],
        ]);

        $ticket->consultant_id = $validated['consultant_id'];

        if ($ticket->status === 'open') {
            $ticket->status = 'assigned';
        }

        $ticket->save();
        $ticket->load(['consultant:id,name,email', 'customer:id,name,email']);

        return response()->json([
            'data' => $ticket,
            'message' => 'Consultant assigned successfully.',
        ]);
    }

    public function comments(Request $request, Ticket $ticket): JsonResponse
    {
        if (!$this->canViewTicket($request->user(), $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comments = $this->commentQueryFor($request->user(), $ticket)
            ->latest()
            ->paginate($request->integer('per_page', 50));

        return response()->json($comments);
    }

    public function addComment(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$this->canViewTicket($user, $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        $isInternal = (bool) ($validated['is_internal'] ?? false);

        if ($isInternal && !($user->isAdmin() || $user->isConsultant())) {
            return response()->json([
                'message' => 'Only consultants and admins can create internal comments.',
            ], 403);
        }

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'is_internal' => $isInternal,
        ]);

        if ($user->isCustomer() && !$isInternal && $ticket->status === 'awaiting_customer') {
            $ticket->update(['status' => 'awaiting_consultant']);
        }

        if (($user->isConsultant() || $user->isAdmin()) && !$isInternal && $ticket->status === 'awaiting_consultant') {
            $ticket->update(['status' => 'awaiting_customer']);
        }

        $comment->load('user:id,name,email');

        return response()->json(['data' => $comment], 201);
    }

    public function consultants(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $consultants = User::query()
            ->where('role', 'consultant')
            ->where('status', 'active')
            ->withCount([
                'assignedTickets as open_tickets_count' => fn ($query) => $query->whereNotIn('status', ['completed', 'cancelled']),
            ])
            ->orderBy('open_tickets_count')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json(['data' => $consultants]);
    }

    private function commentQueryFor(User $user, Ticket $ticket)
    {
        return $ticket->comments()
            ->with('user:id,name,email')
            ->when(
                $ticket->customer_id === $user->id && !$user->isAdmin() && !$user->isConsultant(),
                fn ($query) => $query->where('is_internal', false)
            );
    }

    private function canViewTicket(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin()
            || $ticket->customer_id === $user->id
            || $ticket->consultant_id === $user->id;
    }

    private function generateTicketNumber(): string
    {
        $year = now()->format('Y');
        $sequence = (Ticket::max('id') ?? 0) + 1;

        do {
            $ticketNumber = sprintf('TK-%s-%05d', $year, $sequence);
            $sequence++;
        } while (Ticket::query()->where('ticket_number', $ticketNumber)->exists());

        return $ticketNumber;
    }
}
