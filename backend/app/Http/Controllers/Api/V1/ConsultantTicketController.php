<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ConsultationFormInvitation;
use App\Models\ConsultationFormTemplate;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ConsultantTicketController extends Controller
{
    public function __construct(
        private TransactionalEmailService $transactionalEmailService,
        private ?\App\Services\GoogleCalendarService $googleCalendarService = null
    ) {
        $this->googleCalendarService = $googleCalendarService ?? app(\App\Services\GoogleCalendarService::class);
    }

    /**
     * Get consultant dashboard stats (simplified for main dashboard)
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureConsultantScope($user);

        $baseQuery = $this->consultantBaseQuery($user);

        $stats = [
            'assigned' => (clone $baseQuery)->where('status', 'assigned')->count(),
            'scheduled' => (clone $baseQuery)->where('status', 'scheduled')->count(),
            'completed_this_month' => (clone $baseQuery)
                ->where('status', 'completed')
                ->whereBetween('resolved_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'pending_action' => (clone $baseQuery)
                ->where('status', 'assigned')
                ->whereNotNull('preferred_time_slots')
                ->count(),
        ];

        return response()->json(['data' => $stats]);
    }

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
            'consultation_notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $previousStatus = $ticket->status;
        $ticket->fill($validated);

        if (($validated['status'] ?? null) === 'completed') {
            $ticket->resolved_at = now();
        }

        if (array_key_exists('status', $validated) && $validated['status'] !== 'completed') {
            $ticket->resolved_at = null;
        }

        $ticket->save();
        $ticket->load(['customer:id,name,email', 'consultant:id,name,email', 'property:id,property_name', 'service:id,name']);

        if (($validated['status'] ?? null) && $previousStatus !== $ticket->status) {
            $this->createNotification(
                (int) $ticket->customer_id,
                'ticket.status.updated',
                'Ticket status updated',
                "Ticket {$ticket->ticket_number} is now {$ticket->status}.",
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'from_status' => $previousStatus,
                    'to_status' => $ticket->status,
                ]
            );

            if ($ticket->customer_id) {
                $customer = User::query()->find($ticket->customer_id);
                if ($customer) {
                    $this->transactionalEmailService->sendTicketStatusUpdated($customer, $ticket, $previousStatus);
                }
            }
        }

        return response()->json(['data' => $ticket]);
    }

    public function addComment(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $validated = $request->validate([
            'body' => ['nullable', 'string', 'required_without:attachments'],
            'is_internal' => ['nullable', 'boolean'],
            'attachments' => ['nullable', 'array', 'max:5', 'required_without:body'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
        ]);

        $isInternal = (bool) ($validated['is_internal'] ?? false);
        $bodyText = trim((string) ($validated['body'] ?? ''));
        $incomingAttachments = $request->file('attachments', []);

        if ($bodyText === '' && empty(is_array($incomingAttachments) ? $incomingAttachments : [$incomingAttachments])) {
            return response()->json([
                'message' => 'A comment body or at least one attachment is required.',
            ], 422);
        }

        $attachmentPaths = $this->storeCommentAttachments(
            $ticket->id,
            $incomingAttachments
        );

        $comment = TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $bodyText,
            'is_internal' => $isInternal,
            'attachments' => $attachmentPaths ?: null,
        ]);

        if (!$isInternal && $ticket->status === 'awaiting_consultant') {
            $ticket->update(['status' => 'awaiting_customer']);
        }

        if (!$isInternal) {
            $this->createNotification(
                (int) $ticket->customer_id,
                'ticket.comment.added',
                'Ticket updated by consultant',
                "A new update was posted on ticket {$ticket->ticket_number}.",
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'comment_id' => $comment->id,
                ]
            );

            if ($ticket->customer_id) {
                $customer = User::query()->find($ticket->customer_id);
                if ($customer) {
                    $this->transactionalEmailService->sendTicketCommentAdded($customer, $ticket, 'Consultant', $bodyText);
                }
            }
        }

        $comment->load('user:id,name,email');

        return response()->json(['data' => $comment], 201);
    }

    /**
     * Confirm a time slot and create Google Meet link
     */
    public function confirmSlot(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $validated = $request->validate([
            'slot_index' => ['required', 'integer', 'min:0'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
        ]);

        // Get preferred time slots
        $preferredSlots = $ticket->preferred_time_slots;
        if (empty($preferredSlots) || !is_array($preferredSlots)) {
            return response()->json([
                'message' => 'This ticket does not have preferred time slots.',
            ], 422);
        }

        $slotIndex = $validated['slot_index'];
        if (!isset($preferredSlots[$slotIndex])) {
            return response()->json([
                'message' => 'Invalid slot index.',
            ], 422);
        }

        $selectedSlot = $preferredSlots[$slotIndex];
        $duration = $validated['duration_minutes'] ?? 60;

        // Parse the selected time slot
        $slotDate = $selectedSlot['date'] ?? null;
        $slotTime = $selectedSlot['time'] ?? null;

        if (!$slotDate || !$slotTime) {
            return response()->json([
                'message' => 'Selected slot is missing date or time information.',
            ], 422);
        }

        // Combine date and time into a Carbon instance
        $startTime = \Carbon\Carbon::parse("{$slotDate} {$slotTime}");

        // Attempt Google Calendar meeting creation with graceful fallback
        $meetingData = null;
        $calendarWarning = null;

        try {
            $meetingData = $this->googleCalendarService->createConsultationMeeting(
                $ticket,
                $startTime,
                $duration
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Google Calendar unavailable; scheduling without meet link.', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
            ]);
            $calendarWarning = 'Google Calendar is unavailable. The slot has been confirmed but no Meet link was generated. Please create a meeting link manually and update the ticket.';
        }

        $meetLink = $meetingData['meet_link'] ?? null;

        // Update ticket with meeting details (proceeds even without a meet link)
        $ticket->update([
            'scheduled_at' => $startTime,
            'meeting_url' => $meetLink,
            'meeting_duration_minutes' => $duration,
            'status' => 'scheduled',
        ]);

        // Send notification to customer
        $this->createNotification(
            (int) $ticket->customer_id,
            'ticket.meeting.scheduled',
            'Meeting scheduled',
            "Your consultation for ticket {$ticket->ticket_number} has been scheduled for {$startTime->format('M d, Y \a\t g:i A')}.",
            array_filter([
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'scheduled_at' => $startTime->toISOString(),
                'meet_link' => $meetLink,
                'calendar_link' => $meetingData['calendar_link'] ?? null,
            ])
        );

        // Send meeting confirmation email to customer
        if ($ticket->customer_id) {
            $customer = User::query()->find($ticket->customer_id);
            if ($customer && $customer->email) {
                $this->transactionalEmailService->sendMeetingScheduled(
                    $customer,
                    $ticket,
                    $meetLink ?? '',
                    $startTime,
                    $duration,
                );
            }
        }

        $ticket->load(['customer:id,name,email', 'consultant:id,name,email', 'property:id,property_name', 'service:id,name']);

        $response = [
            'data' => $ticket,
            'meeting' => $meetingData,
        ];

        if ($calendarWarning) {
            $response['warning'] = $calendarWarning;
        }

        return response()->json($response);
    }

    /**
     * Send a consultation form to the customer via email
     */
    public function sendForm(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $validated = $request->validate([
            'template_id' => ['required', 'exists:consultation_form_templates,id'],
        ]);

        $template = ConsultationFormTemplate::findOrFail($validated['template_id']);

        // Resolve customer email from the ticket's customer
        $customer = $ticket->customer;
        if (!$customer || !$customer->email) {
            return response()->json([
                'message' => 'This ticket does not have a customer with a valid email.',
            ], 422);
        }

        $invitation = ConsultationFormInvitation::create([
            'ticket_id' => $ticket->id,
            'template_id' => $template->id,
            'consultant_id' => $user->id,
            'customer_email' => $customer->email,
            'status' => 'pending',
            'sent_at' => now(),
            'expires_at' => now()->addDays(7),
        ]);

        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $formUrl = "{$frontendUrl}/forms/{$invitation->token}";

        $this->transactionalEmailService->sendFormInvitation(
            $customer->email,
            $ticket,
            $template->name,
            $formUrl,
        );

        // Notify customer in-app
        $this->createNotification(
            (int) $ticket->customer_id,
            'ticket.form.sent',
            'Consultation form requested',
            "Your consultant has sent you a form to complete for ticket {$ticket->ticket_number}. Check your email.",
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'template_name' => $template->name,
                'invitation_id' => $invitation->id,
            ]
        );

        $invitation->load('template');

        return response()->json(['data' => $invitation], 201);
    }

    /**
     * List form invitations sent for a ticket
     */
    public function formInvitations(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $this->ensureCanAccessTicket($user, $ticket);

        $invitations = ConsultationFormInvitation::where('ticket_id', $ticket->id)
            ->with('template:id,name')
            ->latest()
            ->get();

        return response()->json(['data' => $invitations]);
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

    /**
     * @param array<int, UploadedFile>|UploadedFile|null $files
     * @return array<int, string>
     */
    private function storeCommentAttachments(int $ticketId, UploadedFile|array|null $files): array
    {
        if ($files === null) {
            return [];
        }

        $normalized = is_array($files) ? $files : [$files];
        if (empty($normalized)) {
            return [];
        }

        $disk = app()->environment('production') ? 's3' : 'local';
        $storedPaths = [];

        foreach ($normalized as $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $extension = strtolower((string) $file->getClientOriginalExtension());
            $safeExt = $extension !== '' ? $extension : 'bin';
            $path = "ticket-comments/{$ticketId}/".Str::uuid().".{$safeExt}";
            Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()));
            $storedPaths[] = $path;
        }

        return $storedPaths;
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
