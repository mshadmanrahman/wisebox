<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_property_when_co_owners_total_is_less_than_100(): void
    {
        $user = User::factory()->create();
        [$propertyTypeId, $ownershipStatusId, $ownershipTypeId] = $this->createReferenceData();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/properties', [
            'property_name' => 'Family Building',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'co_owners' => [
                [
                    'name' => 'Sibling Owner',
                    'relationship' => 'Sibling',
                    'ownership_percentage' => 53,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.property_name', 'Family Building');

        $propertyId = $response->json('data.id');

        $this->assertDatabaseHas('co_owners', [
            'property_id' => $propertyId,
            'name' => 'Sibling Owner',
            'ownership_percentage' => 53.00,
        ]);
    }

    public function test_user_cannot_create_property_when_co_owner_total_exceeds_100(): void
    {
        $user = User::factory()->create();
        [$propertyTypeId, $ownershipStatusId, $ownershipTypeId] = $this->createReferenceData();

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/properties', [
            'property_name' => 'Family Building',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'co_owners' => [
                [
                    'name' => 'Sibling Owner',
                    'relationship' => 'Sibling',
                    'ownership_percentage' => 60,
                ],
                [
                    'name' => 'Parent Owner',
                    'relationship' => 'Parent',
                    'ownership_percentage' => 50,
                ],
            ],
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Co-owner percentages cannot exceed 100%.');
    }

    public function test_user_cannot_update_property_when_co_owner_total_exceeds_100(): void
    {
        $user = User::factory()->create();
        [$propertyTypeId, $ownershipStatusId, $ownershipTypeId] = $this->createReferenceData();

        $property = Property::create([
            'user_id' => $user->id,
            'property_name' => 'Existing Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);

        Sanctum::actingAs($user);

        $this->putJson("/api/v1/properties/{$property->id}", [
            'co_owners' => [
                [
                    'name' => 'Sibling Owner',
                    'relationship' => 'Sibling',
                    'ownership_percentage' => 75,
                ],
                [
                    'name' => 'Parent Owner',
                    'relationship' => 'Parent',
                    'ownership_percentage' => 30,
                ],
            ],
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Co-owner percentages cannot exceed 100%.');
    }

    private function createReferenceData(): array
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Building',
            'slug' => 'building',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Purchased',
            'slug' => 'purchased',
            'display_label' => 'I purchased it',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Joint Ownership',
            'slug' => 'joint',
            'requires_co_owners' => true,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [$propertyTypeId, $ownershipStatusId, $ownershipTypeId];
    }
}
