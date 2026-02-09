<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Ticket;
use App\Models\TicketComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = Ticket::query()
            ->with(['property:id,property_name', 'service:id,name', 'consultant:id,name,email'])
            ->when($user->isAdmin(), fn ($query) => $query)
            ->when($user->isConsultant(), fn ($query) => $query->where('consultant_id', $user->id))
            ->when($user->isCustomer(), fn ($query) => $query->where('customer_id', $user->id))
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
        if (!$this->canViewTicket($request->user(), $ticket)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $ticket->load([
            'property',
            'service',
            'customer:id,name,email',
            'consultant:id,name,email',
            'comments.user:id,name,email',
        ]);

        return response()->json(['data' => $ticket]);
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

        $comment->load('user:id,name,email');

        return response()->json(['data' => $comment], 201);
    }

    private function canViewTicket($user, Ticket $ticket): bool
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
