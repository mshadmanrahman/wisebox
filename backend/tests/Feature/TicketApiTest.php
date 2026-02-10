<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
            ->assertJsonPath('data.consultant.id', $consultant->id);

        $bookingUrl = (string) $response->json('data.booking_url');

        $this->assertStringContainsString('https://calendly.com/wisebox-consultant/intake', $bookingUrl);
        $this->assertStringContainsString('ticket_id='.$ticket->id, $bookingUrl);
        $this->assertStringContainsString('ticket_number='.urlencode($ticket->ticket_number), $bookingUrl);
        $this->assertStringContainsString('customer_email='.urlencode((string) $customer->email), $bookingUrl);
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
