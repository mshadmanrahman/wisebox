<?php

namespace App\Services;

use App\Models\ConsultationMeeting;
use App\Models\Ticket;
use Carbon\Carbon;
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventDateTime;
use Google\Service\Calendar\ConferenceData;
use Google\Service\Calendar\CreateConferenceRequest;
use Google\Service\Calendar\ConferenceSolutionKey;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class GoogleCalendarService
{
    private GoogleClient $client;

    public function __construct()
    {
        $this->client = new GoogleClient();
        $this->client->setApplicationName(config('app.name'));
        $this->client->setScopes([
            GoogleCalendar::CALENDAR_EVENTS,
            GoogleCalendar::CALENDAR,
        ]);
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    /**
     * Create a consultation meeting with Google Meet link
     *
     * @param Ticket $ticket
     * @param Carbon $startTime
     * @param int $durationMinutes
     * @return array{event_id: string, meet_link: string, calendar_link: string}
     * @throws RuntimeException
     */
    public function createConsultationMeeting(
        Ticket $ticket,
        Carbon $startTime,
        int $durationMinutes = 60
    ): array {
        try {
            // Set access token (in production, this should come from database)
            $accessToken = $this->getAccessToken();
            $this->client->setAccessToken($accessToken);

            // Refresh token if expired
            if ($this->client->isAccessTokenExpired()) {
                $refreshToken = $this->client->getRefreshToken();
                $this->client->fetchAccessTokenWithRefreshToken($refreshToken);
                $this->saveAccessToken($this->client->getAccessToken());
            }

            $service = new GoogleCalendar($this->client);

            $event = $this->buildEvent($ticket, $startTime, $durationMinutes);

            // Create the event with conference (Google Meet)
            $createdEvent = $service->events->insert(
                'primary',
                $event,
                ['conferenceDataVersion' => 1, 'sendUpdates' => 'all']
            );

            $meetLink = $createdEvent->getHangoutLink()
                ?? data_get($createdEvent->getConferenceData(), 'entryPoints.0.uri')
                ?? null;

            if (!$meetLink) {
                throw new RuntimeException('Failed to generate Google Meet link');
            }

            return [
                'event_id' => $createdEvent->getId(),
                'meet_link' => $meetLink,
                'calendar_link' => $createdEvent->getHtmlLink(),
            ];

        } catch (Throwable $e) {
            Log::error('Failed to create Google Calendar event', [
                'ticket_id' => $ticket->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw new RuntimeException('Failed to create meeting: ' . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Build Google Calendar Event object
     */
    private function buildEvent(Ticket $ticket, Carbon $startTime, int $durationMinutes): Event
    {
        $endTime = $startTime->copy()->addMinutes($durationMinutes);

        $event = new Event([
            'summary' => "Wisebox Consultation: {$ticket->ticket_number}",
            'description' => $this->buildEventDescription($ticket),
            'start' => new EventDateTime([
                'dateTime' => $startTime->toRfc3339String(),
                'timeZone' => config('app.timezone', 'UTC'),
            ]),
            'end' => new EventDateTime([
                'dateTime' => $endTime->toRfc3339String(),
                'timeZone' => config('app.timezone', 'UTC'),
            ]),
            'attendees' => $this->buildAttendees($ticket),
            'conferenceData' => $this->buildConferenceData(),
            'reminders' => [
                'useDefault' => false,
                'overrides' => [
                    ['method' => 'email', 'minutes' => 24 * 60], // 1 day before
                    ['method' => 'popup', 'minutes' => 60],      // 1 hour before
                ],
            ],
        ]);

        return $event;
    }

    /**
     * Build event description with ticket details
     */
    private function buildEventDescription(Ticket $ticket): string
    {
        $description = [];
        $description[] = "Ticket: {$ticket->ticket_number}";
        $description[] = "Customer: {$ticket->customer->name}";
        $description[] = "Service: {$ticket->service?->name}";

        if ($ticket->property) {
            $description[] = "Property: {$ticket->property->property_name}";
        }

        $description[] = "";
        $description[] = "--- Consultation Notes ---";
        $description[] = $ticket->title;

        if ($ticket->description) {
            $description[] = "";
            $description[] = $ticket->description;
        }

        return implode("\n", $description);
    }

    /**
     * Build attendees list
     */
    private function buildAttendees(Ticket $ticket): array
    {
        $attendees = [];

        // Add customer
        if ($ticket->customer?->email) {
            $attendees[] = [
                'email' => $ticket->customer->email,
                'displayName' => $ticket->customer->name,
                'responseStatus' => 'needsAction',
            ];
        }

        // Add consultant
        if ($ticket->consultant?->email) {
            $attendees[] = [
                'email' => $ticket->consultant->email,
                'displayName' => $ticket->consultant->name,
                'responseStatus' => 'accepted',
                'organizer' => true,
            ];
        }

        return $attendees;
    }

    /**
     * Build conference data for Google Meet
     */
    private function buildConferenceData(): ConferenceData
    {
        $conferenceRequest = new CreateConferenceRequest();
        $conferenceRequest->setRequestId(uniqid('wisebox_', true));

        $conferenceSolution = new ConferenceSolutionKey();
        $conferenceSolution->setType('hangoutsMeet');
        $conferenceRequest->setConferenceSolutionKey($conferenceSolution);

        $conferenceData = new ConferenceData();
        $conferenceData->setCreateRequest($conferenceRequest);

        return $conferenceData;
    }

    /**
     * Get access token from cache, falling back to env config.
     */
    private function getAccessToken(): array
    {
        // Check cache first (populated after token refresh)
        $cached = Cache::get('google_calendar_token');
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }

        // Fall back to env/config
        $token = config('services.google.access_token');

        if (!$token) {
            throw new RuntimeException('Google access token not configured. Run: php artisan google:auth');
        }

        $decoded = is_array($token) ? $token : json_decode($token, true);

        // Seed the cache so subsequent calls use it
        Cache::put('google_calendar_token', $decoded, 3500);

        return $decoded;
    }

    /**
     * Persist access token to cache (survives token refresh within the hour).
     */
    private function saveAccessToken(array $token): void
    {
        Cache::put('google_calendar_token', $token, 3500); // just under 1hr
        Log::info('Google access token refreshed and cached.');
    }

    /**
     * Get OAuth authorization URL
     */
    public function getAuthUrl(): string
    {
        return $this->client->createAuthUrl();
    }

    /**
     * Handle OAuth callback
     */
    public function handleCallback(string $code): array
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new RuntimeException('OAuth error: ' . $token['error']);
        }

        $this->saveAccessToken($token);

        return $token;
    }

    /**
     * Delete/cancel a meeting
     */
    public function deleteMeeting(string $eventId): bool
    {
        try {
            $accessToken = $this->getAccessToken();
            $this->client->setAccessToken($accessToken);

            $service = new GoogleCalendar($this->client);
            $service->events->delete('primary', $eventId);

            return true;
        } catch (Throwable $e) {
            Log::error('Failed to delete Google Calendar event', [
                'event_id' => $eventId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
