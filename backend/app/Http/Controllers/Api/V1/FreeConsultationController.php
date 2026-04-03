<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FreeConsultationController extends Controller
{
    public function __construct(
        private TransactionalEmailService $transactionalEmailService
    ) {}
    /**
     * Create a free consultation request.
     * This creates a Ticket with order_id=null and a 'free_consultation' type marker.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'description' => ['nullable', 'string', 'max:2000'],
            'preferred_slots' => ['required', 'array', 'min:1', 'max:5'],
            'preferred_slots.*.date' => ['required', 'date', 'after_or_equal:today'],
            'preferred_slots.*.time' => ['required', 'string'],
        ]);

        // Verify user owns this property
        $property = $user->properties()->find($validated['property_id']);
        if (!$property) {
            return response()->json([
                'message' => __('messages.property_not_found_or_not_owned'),
            ], 404);
        }

        // Check for existing active consultation on this property
        $existingActive = Ticket::where('customer_id', $user->id)
            ->where('property_id', $validated['property_id'])
            ->where('is_free_consultation', true)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->exists();

        if ($existingActive) {
            return response()->json([
                'message' => __('messages.active_consultation_exists'),
            ], 422);
        }

        $ticket = Ticket::create([
            'ticket_number' => 'FC-' . strtoupper(Str::random(8)),
            'customer_id' => $user->id,
            'property_id' => $validated['property_id'],
            'order_id' => null,
            'service_id' => null,
            'title' => 'Free Consultation Request',
            'description' => $validated['description'] ?? '',
            'preferred_time_slots' => $validated['preferred_slots'],
            'priority' => 'medium',
            'status' => 'open',
            'is_free_consultation' => true,
        ]);

        // Notify admins
        $admins = User::where('role', 'admin')->orWhere('role', 'super_admin')->get();
        foreach ($admins as $admin) {
            $this->createNotification(
                $admin->id,
                'consultation.new_request',
                __('messages.notif_new_consultation_title'),
                __('messages.notif_new_consultation_body', ['customer_name' => $user->name, 'property_name' => $property->property_name]),
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'property_id' => $property->id,
                    'customer_name' => $user->name,
                ]
            );
        }

        $ticket->load(['customer:id,name,email', 'property:id,property_name']);

        // Send confirmation email to customer
        if ($ticket->customer) {
            $this->transactionalEmailService->sendTicketCreated($ticket->customer, $ticket);
        }

        return response()->json([
            'data' => $ticket,
            'message' => __('messages.free_consultation_submitted'),
        ], 201);
    }

    /**
     * List user's consultation requests.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $consultations = Ticket::where('customer_id', $user->id)
            ->where('is_free_consultation', true)
            ->with(['property:id,property_name', 'consultant:id,name,email'])
            ->latest()
            ->paginate($request->integer('per_page', 10));

        return response()->json($consultations);
    }

    /**
     * Check if the authenticated user has already used their free consultation.
     *
     * Returns true if any free consultation ticket exists (any status),
     * meaning the user should not be offered another free consultation.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $hasUsed = Ticket::where('customer_id', $user->id)
            ->where('is_free_consultation', true)
            ->exists();

        $activeTicket = null;
        if ($hasUsed) {
            $activeTicket = Ticket::where('customer_id', $user->id)
                ->where('is_free_consultation', true)
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->with('property:id,property_name')
                ->first(['id', 'ticket_number', 'status', 'property_id', 'created_at']);
        }

        return response()->json([
            'data' => [
                'has_used_free_consultation' => $hasUsed,
                'active_ticket' => $activeTicket,
            ],
        ]);
    }

    /**
     * Get a single consultation request.
     */
    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if ($ticket->customer_id !== $user->id) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $ticket->load([
            'property.documents.documentType',
            'property.propertyType',
            'property.ownershipStatus',
            'consultant:id,name,email',
            'comments.user:id,name,email',
        ]);

        return response()->json(['data' => $ticket]);
    }

    private function createNotification(
        int $userId,
        string $type,
        string $title,
        ?string $body = null,
        array $data = []
    ): void {
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => !empty($data) ? json_encode($data, JSON_UNESCAPED_SLASHES) : null,
            'created_at' => now(),
        ]);
    }
}
