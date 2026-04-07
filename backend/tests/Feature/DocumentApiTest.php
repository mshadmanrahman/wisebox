<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear seeded reference data that conflicts with test inserts
        DB::table('document_types')->delete();
        DB::table('property_types')->delete();
        DB::table('ownership_statuses')->delete();
        DB::table('ownership_types')->delete();
    }

    public function test_property_documents_index_returns_document_types_and_uploaded_arrays(): void
    {
        $user = User::factory()->create();

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
            'name' => 'Sole Ownership',
            'slug' => 'sole',
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $property = Property::create([
            'user_id' => $user->id,
            'property_name' => 'Family Building',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);

        $documentTypeId = DB::table('document_types')->insertGetId([
            'name' => 'Deed',
            'slug' => 'deed',
            'category' => 'primary',
            'is_required' => true,
            'accepted_formats' => json_encode(['pdf', 'jpg']),
            'max_file_size_mb' => 10,
            'score_weight' => 10,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('property_documents')->insert([
            'property_id' => $property->id,
            'document_type_id' => $documentTypeId,
            'user_id' => $user->id,
            'file_path' => 'documents/1/deed/test.pdf',
            'file_name' => 'test.pdf',
            'file_size' => 12345,
            'mime_type' => 'application/pdf',
            'status' => 'uploaded',
            'has_document' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/properties/{$property->id}/documents")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'document_types',
                    'uploaded',
                ],
            ])
            ->assertJsonPath('data.document_types.0.slug', 'deed')
            ->assertJsonPath('data.document_types.0.accepted_formats.0', 'pdf')
            ->assertJsonPath('data.uploaded.0.file_name', 'test.pdf');
    }
}
