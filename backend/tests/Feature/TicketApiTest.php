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
