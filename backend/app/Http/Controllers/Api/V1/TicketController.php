<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Services\CalendlyService;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function __construct(
        private CalendlyService $calendlyService,
        private TransactionalEmailService $transactionalEmailService
    ) {}

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
            return response()->json(['message' => __('messages.forbidden')], 403);
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

        $customer = $ticket->customer;
        if ($customer) {
            $this->transactionalEmailService->sendTicketCreated($customer, $ticket);
        }

        return response()->json(['data' => $ticket], 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$this->canViewTicket($user, $ticket)) {
            return response()->json(['message' => __('messages.forbidden')], 403);
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
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:open,assigned,in_progress,awaiting_customer,awaiting_consultant,scheduled,completed,cancelled',
            ],
            'resolution_notes' => ['nullable', 'string'],
        ]);

        $previousStatus = $ticket->status;
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

        if ($previousStatus !== $ticket->status) {
            $this->createNotification(
                (int) $ticket->customer_id,
                'ticket.status.updated',
                __('messages.notif_ticket_status_updated_title'),
                __('messages.notif_ticket_status_updated_body', ['ticket_number' => $ticket->ticket_number, 'status' => $ticket->status]),
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

            // Notify admins when a ticket is completed
            if ($ticket->status === 'completed') {
                $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
                foreach ($admins as $admin) {
                    $this->createNotification(
                        (int) $admin->id,
                        'ticket.completed',
                        __('messages.notif_ticket_completed_title'),
                        __('messages.notif_ticket_completed_body', ['ticket_number' => $ticket->ticket_number]),
                        [
                            'ticket_id' => $ticket->id,
                            'ticket_number' => $ticket->ticket_number,
                        ]
                    );
                }
            }
        }

        return response()->json(['data' => $ticket]);
    }

    public function assignConsultant(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $validated = $request->validate([
            'consultant_id' => [
                'required',
                Rule::exists('users', 'id')->where(
                    fn ($query) => $query->where('role', 'consultant')->where('status', 'active')
                ),
            ],
        ]);

        $previousConsultantId = $ticket->consultant_id;
        $ticket->consultant_id = $validated['consultant_id'];

        if ($ticket->status === 'open') {
            $ticket->status = 'assigned';
        }

        $ticket->save();
        $ticket->load(['consultant:id,name,email', 'customer:id,name,email']);

        if ($ticket->consultant_id && $ticket->consultant_id !== $previousConsultantId) {
            $this->createNotification(
                (int) $ticket->consultant_id,
                'ticket.assigned',
                __('messages.notif_ticket_assigned_title'),
                __('messages.notif_ticket_assigned_body', ['ticket_number' => $ticket->ticket_number]),
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                ]
            );

            if ($ticket->consultant) {
                $this->transactionalEmailService->sendTicketAssigned($ticket->consultant, $ticket);
            }
        }

        $this->createNotification(
            (int) $ticket->customer_id,
            'ticket.consultant.assigned',
            __('messages.notif_consultant_assigned_title'),
            __('messages.notif_consultant_assigned_body', ['ticket_number' => $ticket->ticket_number]),
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'consultant_id' => $ticket->consultant_id,
            ]
        );

        if ($ticket->customer) {
            $this->transactionalEmailService->sendTicketAssigned($ticket->customer, $ticket);
        }

        return response()->json([
            'data' => $ticket,
            'message' => __('messages.consultant_assigned'),
        ]);
    }

    public function comments(Request $request, Ticket $ticket): JsonResponse
    {
        if (!$this->canViewTicket($request->user(), $ticket)) {
            return response()->json(['message' => __('messages.forbidden')], 403);
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
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

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
                'message' => __('messages.comment_or_attachment_required'),
            ], 422);
        }

        if ($isInternal && !($user->isAdmin() || $user->isConsultant())) {
            return response()->json([
                'message' => __('messages.internal_comment_restricted'),
            ], 403);
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

        if ($user->isCustomer() && !$isInternal && $ticket->status === 'awaiting_customer') {
            $ticket->update(['status' => 'awaiting_consultant']);
        }

        if (($user->isConsultant() || $user->isAdmin()) && !$isInternal && $ticket->status === 'awaiting_consultant') {
            $ticket->update(['status' => 'awaiting_customer']);
        }

        if (!$isInternal) {
            if ($user->isCustomer() && $ticket->consultant_id) {
                $this->createNotification(
                    (int) $ticket->consultant_id,
                    'ticket.comment.added',
                    __('messages.notif_customer_comment_title'),
                    __('messages.notif_customer_comment_body', ['ticket_number' => $ticket->ticket_number]),
                    [
                        'ticket_id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'comment_id' => $comment->id,
                    ]
                );

                if ($ticket->consultant_id) {
                    $consultant = User::query()->find($ticket->consultant_id);
                    if ($consultant) {
                        $this->transactionalEmailService->sendTicketCommentAdded($consultant, $ticket, 'Customer');
                    }
                }
            }

            if (($user->isConsultant() || $user->isAdmin()) && $ticket->customer_id) {
                $this->createNotification(
                    (int) $ticket->customer_id,
                    'ticket.comment.added',
                    __('messages.notif_consultant_comment_title'),
                    __('messages.notif_consultant_comment_body', ['ticket_number' => $ticket->ticket_number]),
                    [
                        'ticket_id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'comment_id' => $comment->id,
                    ]
                );

                $customer = User::query()->find($ticket->customer_id);
                if ($customer) {
                    $this->transactionalEmailService->sendTicketCommentAdded($customer, $ticket, 'Consultant');
                }
            }
        }

        $comment->load('user:id,name,email');

        return response()->json(['data' => $comment], 201);
    }

    public function consultants(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => __('messages.forbidden')], 403);
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

    public function consultantWorkload(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        $consultants = User::query()
            ->where('role', 'consultant')
            ->where('status', 'active')
            ->with('consultantProfile:id,user_id,is_available,max_concurrent_tickets,calendly_url')
            ->withCount([
                'assignedTickets as open_tickets_count' => fn ($query) => $query->whereNotIn('status', ['completed', 'cancelled']),
                'assignedTickets as scheduled_tickets_count' => fn ($query) => $query->where('status', 'scheduled'),
            ])
            ->get(['id', 'name', 'email']);

        $ranked = $consultants
            ->map(function (User $consultant) {
                $maxConcurrent = max((int) ($consultant->consultantProfile?->max_concurrent_tickets ?? 10), 1);
                $openCount = (int) ($consultant->open_tickets_count ?? 0);
                $isAvailable = (bool) ($consultant->consultantProfile?->is_available ?? true);
                $utilization = round(($openCount / $maxConcurrent) * 100, 1);

                return [
                    'id' => $consultant->id,
                    'name' => $consultant->name,
                    'email' => $consultant->email,
                    'is_available' => $isAvailable,
                    'open_tickets_count' => $openCount,
                    'scheduled_tickets_count' => (int) ($consultant->scheduled_tickets_count ?? 0),
                    'max_concurrent_tickets' => $maxConcurrent,
                    'utilization_percentage' => $utilization,
                    'has_calendly_url' => filled($consultant->consultantProfile?->calendly_url),
                ];
            })
            ->sortBy([
                ['is_available', 'desc'],
                ['utilization_percentage', 'asc'],
                ['open_tickets_count', 'asc'],
                ['name', 'asc'],
            ])
            ->values()
            ->map(function (array $item, int $index) {
                $item['suggestion_rank'] = $index + 1;
                return $item;
            });

        return response()->json([
            'data' => $ranked,
            'meta' => [
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }

    public function schedulingLink(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if (!$this->canViewTicket($user, $ticket)) {
            return response()->json(['message' => __('messages.forbidden')], 403);
        }

        if (!$ticket->consultant_id) {
            return response()->json([
                'message' => __('messages.no_consultant_assigned'),
            ], 422);
        }

        $ticket->loadMissing([
            'customer:id,name,email',
            'consultant:id,name,email',
            'consultant.consultantProfile:id,user_id,calendly_url',
        ]);

        try {
            $scheduling = $this->calendlyService->createSchedulingLink($ticket);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'booking_url' => $scheduling['booking_url'],
                'mode' => $scheduling['mode'],
                'consultant' => [
                    'id' => $ticket->consultant?->id,
                    'name' => $ticket->consultant?->name,
                    'email' => $ticket->consultant?->email,
                ],
            ],
        ]);
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

        $disk = $this->commentAttachmentDisk();
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

    private function commentAttachmentDisk(): string
    {
        return app()->environment('production') ? 's3' : 'local';
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
