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

class AdminConsultationController extends Controller
{
    public function __construct(
        private TransactionalEmailService $emailService
    ) {}

    /**
     * List all consultation requests (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        // WB-230: Show all tickets by default; optionally filter to free consultations only.
        $query = Ticket::query()
            ->with([
                'customer:id,name,email,phone',
                'property:id,property_name,completion_percentage,completion_status',
                'service:id,name',
                'consultant:id,name,email',
            ])
            ->when($request->boolean('free_only'), fn ($q) => $q->where('is_free_consultation', true))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->latest();

        $consultations = $query->paginate($request->integer('per_page', 20));

        // WB-230: Count all tickets, not just free consultations, so admin sees accurate totals.
        $stats = [
            'pending' => Ticket::where('status', 'open')->count(),
            'assigned' => Ticket::where('status', 'assigned')->count(),
            'scheduled' => Ticket::where('status', 'scheduled')->count(),
            'completed' => Ticket::where('status', 'completed')->count(),
            'rejected' => Ticket::where('status', 'cancelled')->count(),
        ];

        $paginated = $consultations->toArray();
        $paginated['stats'] = $stats;

        return response()->json($paginated);
    }

    /**
     * Show a single consultation request.
     */
    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $ticket->load([
            'customer:id,name,email,phone,country_of_residence',
            'property.documents.documentType',
            'property.propertyType',
            'property.ownershipStatus',
            'property.division',
            'property.district',
            'consultant:id,name,email',
            'comments.user:id,name,email',
        ]);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Approve a consultation request and assign a consultant.
     */
    public function approve(Request $request, Ticket $ticket): JsonResponse
    {
        $this->ensureAdmin($request->user());

        if ($ticket->status !== 'open') {
            return response()->json([
                'message' => __('messages.only_pending_approve'),
            ], 422);
        }

        $validated = $request->validate([
            'consultant_id' => ['required', 'integer', 'exists:users,id'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Verify the consultant exists and has consultant role
        $consultant = User::where('id', $validated['consultant_id'])
            ->where('role', 'consultant')
            ->where('status', 'active')
            ->first();

        if (!$consultant) {
            return response()->json([
                'message' => __('messages.consultant_not_found'),
            ], 422);
        }

        $ticket->update([
            'consultant_id' => $consultant->id,
            'status' => 'assigned',
            'resolution_notes' => $validated['admin_notes'] ?? null,
        ]);

        // Notify consultant via email and in-app
        $this->createNotification(
            $consultant->id,
            'consultation.assigned',
            __('messages.notif_consultation_assigned_title'),
            __('messages.notif_consultation_assigned_body', ['customer_name' => $ticket->customer->name, 'property_name' => $ticket->property->property_name]),
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'property_id' => $ticket->property_id,
                'customer_name' => $ticket->customer->name,
            ]
        );

        // Notify customer
        $this->createNotification(
            $ticket->customer_id,
            'consultation.approved',
            __('messages.notif_consultation_approved_title'),
            __('messages.notif_consultation_approved_body', ['property_name' => $ticket->property->property_name]),
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'consultant_name' => $consultant->name,
            ]
        );

        // Send email to consultant
        if ($consultant->email) {
            $this->emailService->sendTicketAssigned($consultant, $ticket);
        }

        // Send email to customer
        if ($ticket->customer->email) {
            $this->emailService->sendTicketStatusUpdated($ticket->customer, $ticket, 'open');
        }

        $ticket->load(['customer:id,name,email', 'property:id,property_name', 'consultant:id,name,email']);

        return response()->json([
            'data' => $ticket,
            'message' => __('messages.consultation_approved'),
        ]);
    }

    /**
     * Reject a consultation request.
     */
    public function reject(Request $request, Ticket $ticket): JsonResponse
    {
        $this->ensureAdmin($request->user());

        if ($ticket->status !== 'open') {
            return response()->json([
                'message' => __('messages.only_pending_reject'),
            ], 422);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $ticket->update([
            'status' => 'cancelled',
            'resolution_notes' => $validated['reason'],
        ]);

        // Notify customer
        $this->createNotification(
            $ticket->customer_id,
            'consultation.rejected',
            __('messages.notif_consultation_rejected_title'),
            __('messages.notif_consultation_rejected_body', ['property_name' => $ticket->property->property_name, 'reason' => $validated['reason']]),
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'reason' => $validated['reason'],
            ]
        );

        $ticket->load(['customer:id,name,email', 'property:id,property_name']);

        return response()->json([
            'data' => $ticket,
            'message' => __('messages.consultation_rejected'),
        ]);
    }

    /**
     * List available consultants for assignment.
     */
    public function consultants(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $consultants = User::where('role', 'consultant')
            ->where('status', 'active')
            ->with('consultantProfile')
            ->withCount(['assignedTickets as active_tickets_count' => function ($query) {
                $query->whereNotIn('status', ['completed', 'cancelled']);
            }])
            ->get()
            ->map(function (User $consultant) {
                return [
                    'id' => $consultant->id,
                    'name' => $consultant->name,
                    'email' => $consultant->email,
                    'specialization' => $consultant->consultantProfile?->specialization ?? [],
                    'languages' => $consultant->consultantProfile?->languages ?? [],
                    'rating' => $consultant->consultantProfile?->rating ?? 0,
                    'active_tickets_count' => $consultant->active_tickets_count,
                    'max_concurrent' => $consultant->consultantProfile?->max_concurrent_tickets ?? 10,
                    'is_available' => $consultant->consultantProfile?->is_available ?? true,
                ];
            });

        return response()->json(['data' => $consultants]);
    }

    private function ensureAdmin(User $user): void
    {
        abort_unless($user->isAdmin(), 403, __('messages.admin_required'));
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
