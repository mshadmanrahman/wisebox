<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Services\CalendlyWebhookService;
use App\Services\TransactionalEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CalendlyWebhookController extends Controller
{
    public function __construct(
        private CalendlyWebhookService $calendlyWebhookService,
        private TransactionalEmailService $transactionalEmailService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('Calendly-Webhook-Signature');

        if (!$this->calendlyWebhookService->isSignatureValid($rawPayload, $signature)) {
            return response()->json(['message' => 'Invalid Calendly webhook signature.'], 400);
        }

        $event = $request->input('event');
        $payload = (array) $request->input('payload', []);

        if ($event === 'invitee.created') {
            $this->handleInviteeCreated($payload);
        }

        if ($event === 'invitee.canceled') {
            $this->handleInviteeCanceled($payload);
        }

        return response()->json(['received' => true]);
    }

    private function handleInviteeCreated(array $payload): void
    {
        $ticket = $this->resolveTicket($payload);

        if (!$ticket) {
            return;
        }

        $startTime = data_get($payload, 'scheduled_event.start_time')
            ?? data_get($payload, 'event_start_time');

        $endTime = data_get($payload, 'scheduled_event.end_time')
            ?? data_get($payload, 'event_end_time');

        $durationMinutes = null;

        if ($startTime && $endTime) {
            try {
                $durationMinutes = abs(now()->parse($startTime)->diffInMinutes(now()->parse($endTime)));
            } catch (\Throwable) {
                $durationMinutes = null;
            }
        }

        $meetingUrl = data_get($payload, 'scheduled_event.location.join_url')
            ?? data_get($payload, 'scheduled_event.location.location')
            ?? data_get($payload, 'location.join_url')
            ?? data_get($payload, 'location.location');

        $eventUri = data_get($payload, 'event') ?? data_get($payload, 'scheduled_event.uri');

        $updates = [
            'calendly_event_id' => is_string($eventUri) ? $eventUri : $ticket->calendly_event_id,
            'calendly_event_url' => is_string($eventUri) ? $eventUri : $ticket->calendly_event_url,
            'meeting_url' => is_string($meetingUrl) ? $meetingUrl : $ticket->meeting_url,
            'scheduled_at' => $startTime ?: $ticket->scheduled_at,
            'meeting_duration_minutes' => $durationMinutes,
        ];

        if (!in_array($ticket->status, ['completed', 'cancelled'], true)) {
            $updates['status'] = 'scheduled';
        }

        $ticket->update($updates);

        // Send meeting scheduled email + in-app notification to customer
        $ticket->load(['customer', 'consultant', 'property']);

        if ($ticket->customer) {
            $scheduledAt = $startTime ? \Carbon\Carbon::parse($startTime) : now();
            $duration = $durationMinutes ?: 30;
            $link = is_string($meetingUrl) ? $meetingUrl : '';

            if ($link) {
                $this->transactionalEmailService->sendMeetingScheduled(
                    $ticket->customer,
                    $ticket,
                    $link,
                    $scheduledAt,
                    $duration,
                );
            }

            $this->createNotification(
                (int) $ticket->customer_id,
                'ticket.meeting.scheduled',
                'Meeting scheduled',
                "Your meeting for ticket {$ticket->ticket_number} has been scheduled.",
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'meeting_url' => $link,
                    'scheduled_at' => $scheduledAt->toISOString(),
                ]
            );
        }

        // Notify consultant about the scheduled meeting
        if ($ticket->consultant) {
            $scheduledAt = isset($scheduledAt) ? $scheduledAt : (
                $startTime ? \Carbon\Carbon::parse($startTime) : now()
            );
            $duration = $durationMinutes ?: 30;
            $link = isset($link) ? $link : (is_string($meetingUrl) ? $meetingUrl : '');

            if ($link) {
                $this->transactionalEmailService->sendConsultantMeetingScheduled(
                    $ticket->consultant,
                    $ticket,
                    $link,
                    $scheduledAt,
                    $duration,
                );
            }

            $this->createNotification(
                (int) $ticket->consultant_id,
                'ticket.meeting.scheduled',
                'Meeting scheduled with customer',
                "A meeting for ticket {$ticket->ticket_number} has been scheduled by the customer.",
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'meeting_url' => $link,
                    'scheduled_at' => $scheduledAt->toISOString(),
                ]
            );
        }
    }

    private function handleInviteeCanceled(array $payload): void
    {
        $ticket = $this->resolveTicket($payload);

        if (!$ticket) {
            return;
        }

        $nextStatus = $ticket->consultant_id ? 'assigned' : 'open';
        if (in_array($ticket->status, ['completed', 'cancelled'], true)) {
            $nextStatus = $ticket->status;
        }

        $previousStatus = $ticket->status;

        $ticket->update([
            'calendly_event_id' => null,
            'calendly_event_url' => null,
            'meeting_url' => null,
            'scheduled_at' => null,
            'meeting_duration_minutes' => null,
            'status' => $nextStatus,
        ]);

        // Notify customer about meeting cancellation
        $ticket->load(['customer']);

        if ($ticket->customer && $previousStatus !== $nextStatus) {
            $this->createNotification(
                (int) $ticket->customer_id,
                'ticket.meeting.cancelled',
                'Meeting cancelled',
                "The scheduled meeting for ticket {$ticket->ticket_number} has been cancelled.",
                [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'from_status' => $previousStatus,
                    'to_status' => $nextStatus,
                ]
            );

            $this->transactionalEmailService->sendTicketStatusUpdated(
                $ticket->customer,
                $ticket,
                $previousStatus
            );
        }
    }

    private function resolveTicket(array $payload): ?Ticket
    {
        $ticketId = $this->extractTicketId($payload);

        if ($ticketId) {
            return Ticket::query()->find($ticketId);
        }

        $eventUri = data_get($payload, 'event') ?? data_get($payload, 'scheduled_event.uri');

        if ($eventUri) {
            return Ticket::query()
                ->where('calendly_event_id', $eventUri)
                ->orWhere('calendly_event_url', $eventUri)
                ->first();
        }

        return null;
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

    private function extractTicketId(array $payload): ?int
    {
        $candidate = data_get($payload, 'tracking.ticket_id')
            ?? data_get($payload, 'ticket_id')
            ?? data_get($payload, 'tracking.utm_content');

        if (is_numeric($candidate)) {
            return (int) $candidate;
        }

        $qa = data_get($payload, 'questions_and_answers', []);

        if (is_array($qa)) {
            foreach ($qa as $entry) {
                $question = strtolower((string) data_get($entry, 'question', ''));
                $answer = (string) data_get($entry, 'answer', '');

                if (!str_contains($question, 'ticket')) {
                    continue;
                }

                if (is_numeric($answer)) {
                    return (int) $answer;
                }
            }
        }

        return null;
    }
}
