<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\CalendlyWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendlyWebhookController extends Controller
{
    public function __construct(
        private CalendlyWebhookService $calendlyWebhookService
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

        $ticket->update([
            'calendly_event_id' => null,
            'calendly_event_url' => null,
            'meeting_url' => null,
            'scheduled_at' => null,
            'meeting_duration_minutes' => null,
            'status' => $nextStatus,
        ]);
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
