<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardSummaryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_summary_returns_scoped_data_for_authenticated_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        DB::table('sliders')->insert([
            [
                'title' => 'Active slide',
                'subtitle' => 'Visible in dashboard',
                'image_path' => 'slides/active.jpg',
                'cta_text' => 'Start',
                'cta_url' => '/properties/new',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Inactive slide',
                'subtitle' => 'Should be hidden',
                'image_path' => 'slides/inactive.jpg',
                'cta_text' => null,
                'cta_url' => null,
                'is_active' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $property = $this->createPropertyForUser($user, 'dashboard-user-property');
        $otherProperty = $this->createPropertyForUser($otherUser, 'dashboard-other-property');

        DB::table('tickets')->insert([
            [
                'ticket_number' => 'WBX-TKT-1001',
                'property_id' => $property->id,
                'customer_id' => $user->id,
                'title' => 'User ticket',
                'description' => 'Visible ticket',
                'priority' => 'medium',
                'status' => 'open',
                'created_at' => now()->subMinute(),
                'updated_at' => now()->subMinute(),
            ],
            [
                'ticket_number' => 'WBX-TKT-1002',
                'property_id' => $otherProperty->id,
                'customer_id' => $otherUser->id,
                'title' => 'Other user ticket',
                'description' => 'Should not be visible',
                'priority' => 'high',
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('notifications')->insert([
            [
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'type' => 'ticket.assigned',
                'title' => 'User notification',
                'body' => 'Visible notification',
                'data' => null,
                'read_at' => null,
                'created_at' => now()->subMinute(),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $otherUser->id,
                'type' => 'ticket.comment.added',
                'title' => 'Other user notification',
                'body' => 'Should not be visible',
                'data' => null,
                'read_at' => null,
                'created_at' => now(),
            ],
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.counts.properties_total', 1)
            ->assertJsonPath('data.counts.tickets_total', 1)
            ->assertJsonPath('data.counts.tickets_open', 1)
            ->assertJsonPath('data.unread_notifications_count', 1)
            ->assertJsonCount(1, 'data.hero_slides')
            ->assertJsonCount(1, 'data.properties_preview')
            ->assertJsonCount(1, 'data.tickets_preview')
            ->assertJsonCount(1, 'data.notifications_preview');

        $this->assertSame($property->id, (int) $response->json('data.properties_preview.0.id'));
        $this->assertSame($user->id, (int) $response->json('data.notifications_preview.0.user_id'));
    }

    private function createPropertyForUser(User $user, string $name): Property
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
            'name' => 'Purchased',
            'slug' => 'purchased-'.uniqid(),
            'display_label' => 'Purchased',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Single',
            'slug' => 'single-'.uniqid(),
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => $name,
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }
}
