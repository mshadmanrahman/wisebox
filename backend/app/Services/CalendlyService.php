<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class CalendlyService
{
    public function createSchedulingLink(Ticket $ticket): array
    {
        $baseBookingUrl = $ticket->consultant?->consultantProfile?->calendly_url
            ?: config('services.calendly.booking_url');

        $params = array_filter([
            'ticket_id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'customer_email' => $ticket->customer?->email,
            'customer_name' => $ticket->customer?->name,
        ], fn ($value) => filled($value));

        $apiUrl = $this->createViaApi($params);
        if ($apiUrl !== null) {
            return [
                'booking_url' => $apiUrl,
                'mode' => 'api',
            ];
        }

        if (!is_string($baseBookingUrl) || blank($baseBookingUrl)) {
            throw new RuntimeException('Scheduling URL is not configured for this consultant.');
        }

        return [
            'booking_url' => $this->appendQuery($baseBookingUrl, $params),
            'mode' => 'fallback',
        ];
    }

    private function createViaApi(array $params): ?string
    {
        $apiKey = (string) config('services.calendly.api_key');
        $eventTypeUri = (string) config('services.calendly.event_type_uri');
        $baseUrl = rtrim((string) config('services.calendly.base_url', 'https://api.calendly.com'), '/');

        if ($apiKey === '' || $eventTypeUri === '') {
            return null;
        }

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->post("{$baseUrl}/scheduling_links", [
                    'owner' => $eventTypeUri,
                    'owner_type' => 'EventType',
                    'max_event_count' => 1,
                ])
                ->throw();

            $bookingUrl = (string) (
                data_get($response->json(), 'resource.booking_url')
                ?: data_get($response->json(), 'resource.booking_uri')
            );

            if ($bookingUrl === '') {
                return null;
            }

            return $this->appendQuery($bookingUrl, $params);
        } catch (Throwable $exception) {
            Log::warning('Calendly API scheduling link generation failed; falling back to static booking URL.', [
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    private function appendQuery(string $url, array $params): string
    {
        $fragment = parse_url($url, PHP_URL_FRAGMENT);
        $baseWithoutFragment = $fragment !== null ? str_replace('#'.$fragment, '', $url) : $url;
        $existingQuery = parse_url($baseWithoutFragment, PHP_URL_QUERY);
        $baseWithoutQuery = $existingQuery !== null ? str_replace('?'.$existingQuery, '', $baseWithoutFragment) : $baseWithoutFragment;

        $query = [];
        if (is_string($existingQuery) && $existingQuery !== '') {
            parse_str($existingQuery, $query);
        }

        $finalQuery = array_merge($query, $params);
        $finalUrl = $baseWithoutQuery.'?'.http_build_query($finalQuery);

        return $fragment !== null ? $finalUrl.'#'.$fragment : $finalUrl;
    }
}
