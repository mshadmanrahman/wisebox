<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use Database\Seeders\AssessmentQuestionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AssessmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_questions_and_free_assessment_are_available(): void
    {
        $this->seed(AssessmentQuestionSeeder::class);

        $questionsResponse = $this->getJson('/api/v1/assessments/questions')
            ->assertOk()
            ->assertJsonCount(15, 'data');

        $questionIds = collect($questionsResponse->json('data'))->pluck('id')->all();

        $answers = collect($questionIds)
            ->map(fn (int $id) => [
                'question_id' => $id,
                'answer' => $id !== 7,
            ])
            ->values()
            ->all();

        $this->postJson('/api/v1/assessments/free', [
            'email' => 'lead@example.com',
            'answers' => $answers,
        ])->assertOk()
            ->assertJsonPath('data.status', 'green')
            ->assertJsonPath('data.score', 100);

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => 'free_assessment',
            'action' => 'submitted',
        ]);
    }

    public function test_authenticated_property_assessment_generates_record(): void
    {
        $user = User::factory()->create();
        $property = $this->createPropertyForUser($user, 'inheritance-case');

        $deedTypeId = DB::table('document_types')->insertGetId([
            'name' => 'Deed',
            'slug' => 'deed',
            'category' => 'primary',
            'is_required' => true,
            'accepted_formats' => json_encode(['pdf']),
            'max_file_size_mb' => 10,
            'score_weight' => 15,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $positionTypeId = DB::table('document_types')->insertGetId([
            'name' => 'Position',
            'slug' => 'position_of_land',
            'category' => 'primary',
            'is_required' => true,
            'accepted_formats' => json_encode(['pdf']),
            'max_file_size_mb' => 10,
            'score_weight' => 40,
            'is_active' => true,
            'sort_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('property_documents')->insert([
            [
                'property_id' => $property->id,
                'document_type_id' => $deedTypeId,
                'user_id' => $user->id,
                'file_path' => 'tests/deed.pdf',
                'file_name' => 'deed.pdf',
                'file_size' => 1200,
                'mime_type' => 'application/pdf',
                'status' => 'uploaded',
                'has_document' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'property_id' => $property->id,
                'document_type_id' => $positionTypeId,
                'user_id' => $user->id,
                'file_path' => 'tests/position.pdf',
                'file_name' => 'position.pdf',
                'file_size' => 1200,
                'mime_type' => 'application/pdf',
                'status' => 'uploaded',
                'has_document' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/properties/{$property->id}/assessment")
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'property_id',
                    'overall_score',
                    'score_status',
                    'document_score',
                    'ownership_score',
                    'risk_factors',
                    'recommendations',
                    'summary',
                ],
            ]);

        $this->assertSame($property->id, (int) $response->json('data.property_id'));
        $this->assertDatabaseHas('property_assessments', [
            'property_id' => $property->id,
        ]);
    }

    private function createPropertyForUser(User $user, string $ownershipSlug): Property
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
            'name' => 'Inherited',
            'slug' => $ownershipSlug,
            'display_label' => 'Inherited property',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Joint',
            'slug' => 'joint-'.uniqid(),
            'requires_co_owners' => true,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $property = Property::create([
            'user_id' => $user->id,
            'property_name' => 'Assessment Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);

        DB::table('co_owners')->insert([
            'property_id' => $property->id,
            'name' => 'Sibling Owner',
            'relationship' => 'Sibling',
            'ownership_percentage' => 50,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $property;
    }
}
