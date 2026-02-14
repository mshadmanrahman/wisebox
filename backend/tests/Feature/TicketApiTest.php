<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Notifications\TicketCreatedNotification;
use App\Notifications\TicketLifecycleNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_list_and_comment_on_own_ticket(): void
    {
        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00001',
            'property_id' => $property->id,
            'customer_id' => $user->id,
            'title' => 'Need ownership clarification',
            'description' => 'Please review my deed details.',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/tickets')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ticket->id);

        $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'I have uploaded the missing record yesterday.',
        ])->assertCreated()
            ->assertJsonPath('data.ticket_id', $ticket->id)
            ->assertJsonPath('data.is_internal', false);

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_internal' => false,
        ]);
    }

    public function test_customer_cannot_view_another_users_ticket(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $property = $this->createPropertyForUser($owner);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00002',
            'property_id' => $property->id,
            'customer_id' => $owner->id,
            'title' => 'Boundary dispute',
            'priority' => 'high',
            'status' => 'open',
        ]);

        Sanctum::actingAs($otherUser);

        $this->getJson("/api/v1/tickets/{$ticket->id}")
            ->assertForbidden();
    }

    public function test_ticket_creation_sends_confirmation_email_to_customer(): void
    {
        Notification::fake();

        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        $service = DB::table('services')->insertGetId([
            'name' => 'Ownership Verification',
            'slug' => 'ownership-verification-'.uniqid(),
            'pricing_type' => 'free',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/v1/tickets', [
            'property_id' => $property->id,
            'service_id' => $service,
            'title' => 'Please verify my property ownership',
            'description' => 'I need help with my deed.',
            'priority' => 'medium',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.customer_id', $customer->id);

        Notification::assertSentTo($customer, TicketCreatedNotification::class, function (TicketCreatedNotification $notification) use ($property) {
            return $notification->propertyName === $property->property_name
                && $notification->serviceName === 'Ownership Verification';
        });
    }

    public function test_ticket_creation_sends_email_even_without_service(): void
    {
        Notification::fake();

        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        Sanctum::actingAs($customer);

        $this->postJson('/api/v1/tickets', [
            'property_id' => $property->id,
            'title' => 'General inquiry',
        ])->assertCreated();

        Notification::assertSentTo($customer, TicketCreatedNotification::class, function (TicketCreatedNotification $notification) {
            return $notification->serviceName === null;
        });
    }

    public function test_internal_comments_are_hidden_from_customers(): void
    {
        $customer = User::factory()->create();
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00003',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'title' => 'Ownership update needed',
            'priority' => 'medium',
            'status' => 'in_progress',
        ]);

        Sanctum::actingAs($consultant);

        $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'Internal note for consultant workflow.',
            'is_internal' => true,
        ])->assertCreated();

        $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'Public update for the customer.',
            'is_internal' => false,
        ])->assertCreated();

        Sanctum::actingAs($customer);

        $this->getJson("/api/v1/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data.comments')
            ->assertJsonPath('data.comments.0.body', 'Public update for the customer.');

        $this->getJson("/api/v1/tickets/{$ticket->id}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Public update for the customer.');
    }

    public function test_customer_cannot_create_internal_comment(): void
    {
        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00010',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'title' => 'Internal note permission check',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        Sanctum::actingAs($customer);

        $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'Customer should not create internal comments.',
            'is_internal' => true,
        ])->assertForbidden()
            ->assertJsonPath('message', 'Only consultants and admins can create internal comments.');
    }

    public function test_admin_can_assign_consultant_to_ticket(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $customer = User::factory()->create();
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00004',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'title' => 'Need legal review',
            'priority' => 'high',
            'status' => 'open',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/tickets/{$ticket->id}/assign", [
            'consultant_id' => $consultant->id,
        ])->assertOk()
            ->assertJsonPath('data.consultant_id', $consultant->id)
            ->assertJsonPath('data.status', 'assigned');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'consultant_id' => $consultant->id,
            'status' => 'assigned',
        ]);

        $this->getJson('/api/v1/consultants')
            ->assertOk()
            ->assertJsonFragment(['id' => $consultant->id]);
    }

    public function test_customer_can_generate_scheduling_link_for_assigned_ticket(): void
    {
        $customer = User::factory()->create();
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        DB::table('consultant_profiles')->insert([
            'user_id' => $consultant->id,
            'calendly_url' => 'https://calendly.com/wisebox-consultant/intake',
            'is_available' => true,
            'max_concurrent_tickets' => 8,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00005',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'title' => 'Need a scheduling link',
            'priority' => 'medium',
            'status' => 'assigned',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/schedule-link")
            ->assertOk()
            ->assertJsonPath('data.consultant.id', $consultant->id)
            ->assertJsonPath('data.mode', 'fallback');

        $bookingUrl = (string) $response->json('data.booking_url');

        $this->assertStringContainsString('https://calendly.com/wisebox-consultant/intake', $bookingUrl);
        $this->assertStringContainsString('ticket_id='.$ticket->id, $bookingUrl);
        $this->assertStringContainsString('ticket_number='.urlencode($ticket->ticket_number), $bookingUrl);
        $this->assertStringContainsString('customer_email='.urlencode((string) $customer->email), $bookingUrl);
    }

    public function test_scheduling_link_requires_assigned_consultant(): void
    {
        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00011',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'title' => 'Needs assignment first',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        Sanctum::actingAs($customer);

        $this->postJson("/api/v1/tickets/{$ticket->id}/schedule-link")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'This ticket has no assigned consultant yet.');
    }

    public function test_scheduling_link_uses_calendly_api_when_event_type_is_configured(): void
    {
        Http::fake([
            'https://api.calendly.test/scheduling_links' => Http::response([
                'resource' => [
                    'booking_url' => 'https://calendly.com/d/single-use/wisebox-abc123',
                ],
            ], 201),
        ]);

        config([
            'services.calendly.api_key' => 'cal_test_key',
            'services.calendly.base_url' => 'https://api.calendly.test',
            'services.calendly.event_type_uri' => 'https://api.calendly.com/event_types/AAAAAA',
            'services.calendly.booking_url' => 'https://calendly.com/fallback/intake',
        ]);

        $customer = User::factory()->create();
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00008',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'title' => 'Need API scheduling link',
            'priority' => 'medium',
            'status' => 'assigned',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/schedule-link")
            ->assertOk()
            ->assertJsonPath('data.mode', 'api');

        $bookingUrl = (string) $response->json('data.booking_url');
        $this->assertStringContainsString('https://calendly.com/d/single-use/wisebox-abc123', $bookingUrl);
        $this->assertStringContainsString('ticket_id='.$ticket->id, $bookingUrl);
        $this->assertStringContainsString('ticket_number='.urlencode($ticket->ticket_number), $bookingUrl);
    }

    public function test_scheduling_link_falls_back_when_calendly_api_fails(): void
    {
        Http::fake([
            'https://api.calendly.test/scheduling_links' => Http::response([
                'message' => 'upstream failure',
            ], 500),
        ]);

        config([
            'services.calendly.api_key' => 'cal_test_key',
            'services.calendly.base_url' => 'https://api.calendly.test',
            'services.calendly.event_type_uri' => 'https://api.calendly.com/event_types/BBBBBB',
        ]);

        $customer = User::factory()->create();
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        DB::table('consultant_profiles')->insert([
            'user_id' => $consultant->id,
            'calendly_url' => 'https://calendly.com/wisebox-consultant/fallback-intake',
            'is_available' => true,
            'max_concurrent_tickets' => 6,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00009',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'title' => 'Need fallback scheduling link',
            'priority' => 'medium',
            'status' => 'assigned',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/schedule-link")
            ->assertOk()
            ->assertJsonPath('data.mode', 'fallback');

        $bookingUrl = (string) $response->json('data.booking_url');
        $this->assertStringContainsString('https://calendly.com/wisebox-consultant/fallback-intake', $bookingUrl);
    }

    public function test_comment_supports_file_attachments(): void
    {
        Storage::fake('local');

        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00006',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'title' => 'Attachment test ticket',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->post("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'Please see attached files.',
            'attachments' => [
                UploadedFile::fake()->create('evidence.pdf', 80, 'application/pdf'),
                UploadedFile::fake()->image('photo.jpg'),
            ],
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.ticket_id', $ticket->id);

        $comment = TicketComment::query()->latest('id')->first();
        $this->assertNotNull($comment);
        $this->assertIsArray($comment->attachments);
        $this->assertCount(2, $comment->attachments);

        foreach ($comment->attachments as $path) {
            Storage::disk('local')->assertExists($path);
        }
    }

    public function test_assignment_and_public_comment_create_notifications(): void
    {
        Notification::fake();

        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);
        $customer = User::factory()->create();
        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-00007',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'title' => 'Notification hook ticket',
            'priority' => 'high',
            'status' => 'open',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/tickets/{$ticket->id}/assign", [
            'consultant_id' => $consultant->id,
        ])->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $consultant->id,
            'type' => 'ticket.assigned',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'ticket.consultant.assigned',
        ]);

        Notification::assertSentTo($consultant, TicketLifecycleNotification::class, function (TicketLifecycleNotification $notification) {
            return $notification->event === 'assigned';
        });

        Notification::assertSentTo($customer, TicketLifecycleNotification::class, function (TicketLifecycleNotification $notification) {
            return $notification->event === 'assigned';
        });

        Sanctum::actingAs($consultant);

        $this->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'body' => 'Public consultant update',
            'is_internal' => false,
        ])->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'ticket.comment.added',
            'title' => 'Ticket updated by consultant',
        ]);

        Notification::assertSentTo($customer, TicketLifecycleNotification::class, function (TicketLifecycleNotification $notification) {
            return $notification->event === 'comment_added';
        });
    }

    private function createPropertyForUser(User $user): Property
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Residential',
            'slug' => 'residential-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Gifted',
            'slug' => 'gifted-'.uniqid(),
            'display_label' => 'I got it as gift',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Sole',
            'slug' => 'sole-'.uniqid(),
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => 'Ticket Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }
}
