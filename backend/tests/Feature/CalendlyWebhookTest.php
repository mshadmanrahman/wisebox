<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CalendlyWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_invitee_created_updates_ticket_schedule_fields(): void
    {
        config(['services.calendly.webhook_secret' => 'calendly-test-secret']);

        $ticket = $this->createScheduledCandidateTicket();

        $payload = [
            'event' => 'invitee.created',
            'payload' => [
                'tracking' => [
                    'ticket_id' => (string) $ticket->id,
                ],
                'event' => 'https://api.calendly.com/scheduled_events/AAAAAA',
                'scheduled_event' => [
                    'uri' => 'https://api.calendly.com/scheduled_events/AAAAAA',
                    'start_time' => '2026-02-14T10:00:00Z',
                    'end_time' => '2026-02-14T10:30:00Z',
                    'location' => [
                        'join_url' => 'https://meet.google.com/calendly-test',
                    ],
                ],
            ],
        ];

        $this->postCalendlyWebhook($payload, 'calendly-test-secret')
            ->assertOk();

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'scheduled',
            'calendly_event_id' => 'https://api.calendly.com/scheduled_events/AAAAAA',
            'meeting_url' => 'https://meet.google.com/calendly-test',
            'meeting_duration_minutes' => 30,
        ]);
    }

    public function test_invitee_canceled_resets_scheduling_fields(): void
    {
        config(['services.calendly.webhook_secret' => 'calendly-test-secret']);

        $ticket = $this->createScheduledCandidateTicket();
        $ticket->update([
            'status' => 'scheduled',
            'calendly_event_id' => 'https://api.calendly.com/scheduled_events/BBBBBB',
            'calendly_event_url' => 'https://api.calendly.com/scheduled_events/BBBBBB',
            'meeting_url' => 'https://meet.google.com/old-link',
            'scheduled_at' => now()->addDays(2),
            'meeting_duration_minutes' => 45,
        ]);

        $payload = [
            'event' => 'invitee.canceled',
            'payload' => [
                'event' => 'https://api.calendly.com/scheduled_events/BBBBBB',
            ],
        ];

        $this->postCalendlyWebhook($payload, 'calendly-test-secret')
            ->assertOk();

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'assigned',
            'calendly_event_id' => null,
            'calendly_event_url' => null,
            'meeting_url' => null,
            'scheduled_at' => null,
            'meeting_duration_minutes' => null,
        ]);
    }

    public function test_invalid_signature_is_rejected(): void
    {
        config(['services.calendly.webhook_secret' => 'calendly-test-secret']);

        $payload = [
            'event' => 'invitee.created',
            'payload' => [],
        ];

        $body = json_encode($payload, JSON_UNESCAPED_SLASHES);

        $this->call(
            'POST',
            '/api/v1/webhooks/calendly',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Calendly-Webhook-Signature' => 'v1=invalid-signature',
            ],
            $body
        )->assertStatus(400);
    }

    private function createScheduledCandidateTicket(): Ticket
    {
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        return Ticket::create([
            'ticket_number' => 'TK-2026-20001',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'title' => 'Calendly ticket',
            'priority' => 'medium',
            'status' => 'assigned',
        ]);
    }

    private function postCalendlyWebhook(array $payload, string $secret)
    {
        $body = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $signature = hash_hmac('sha256', $body, $secret);

        return $this->call(
            'POST',
            '/api/v1/webhooks/calendly',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_Calendly-Webhook-Signature' => 'v1='.$signature,
            ],
            $body
        );
    }

    private function createPropertyForUser(User $user): Property
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Webhook Residential',
            'slug' => 'webhook-residential-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Webhook Purchased',
            'slug' => 'webhook-purchased-'.uniqid(),
            'display_label' => 'Purchased',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Webhook Sole',
            'slug' => 'webhook-sole-'.uniqid(),
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => 'Webhook Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }
}
