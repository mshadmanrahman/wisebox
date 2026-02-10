<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Service;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConsultantTicketApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_consultant_can_view_assigned_tickets_and_dashboard_stats(): void
    {
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $otherConsultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $customer = User::factory()->create();
        $service = $this->createService();
        $property = $this->createPropertyForUser($customer);

        $assignedTicket = Ticket::create([
            'ticket_number' => 'TK-2026-10001',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'service_id' => $service->id,
            'title' => 'Assigned to consultant',
            'priority' => 'medium',
            'status' => 'assigned',
            'scheduled_at' => now()->addDays(2),
        ]);

        Ticket::create([
            'ticket_number' => 'TK-2026-10002',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $otherConsultant->id,
            'service_id' => $service->id,
            'title' => 'Assigned to another consultant',
            'priority' => 'medium',
            'status' => 'in_progress',
        ]);

        Sanctum::actingAs($consultant);

        $this->getJson('/api/v1/consultant/tickets')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $assignedTicket->id)
            ->assertJsonPath('stats.open_count', 1);

        $this->getJson('/api/v1/consultant/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.open_count', 1)
            ->assertJsonPath('data.stats.upcoming_meetings_count', 1);
    }

    public function test_consultant_can_update_ticket_and_add_comment(): void
    {
        $consultant = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $customer = User::factory()->create();
        $service = $this->createService();
        $property = $this->createPropertyForUser($customer);

        $ticket = Ticket::create([
            'ticket_number' => 'TK-2026-10003',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultant->id,
            'service_id' => $service->id,
            'title' => 'Consultant workspace ticket',
            'priority' => 'high',
            'status' => 'in_progress',
        ]);

        Sanctum::actingAs($consultant);

        $this->putJson("/api/v1/consultant/tickets/{$ticket->id}", [
            'status' => 'scheduled',
            'meeting_url' => 'https://meet.google.com/abc-defg-hij',
            'scheduled_at' => now()->addDay()->toISOString(),
            'meeting_duration_minutes' => 30,
            'resolution_notes' => 'Prepared initial checklist.',
        ])->assertOk()
            ->assertJsonPath('data.status', 'scheduled');

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => 'scheduled',
            'meeting_url' => 'https://meet.google.com/abc-defg-hij',
            'meeting_duration_minutes' => 30,
        ]);

        $this->postJson("/api/v1/consultant/tickets/{$ticket->id}/comments", [
            'body' => 'Customer-facing update',
            'is_internal' => false,
        ])->assertCreated()
            ->assertJsonPath('data.is_internal', false);

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $ticket->id,
            'user_id' => $consultant->id,
            'is_internal' => false,
        ]);
    }

    public function test_customer_cannot_access_consultant_endpoints(): void
    {
        $customer = User::factory()->create();

        Sanctum::actingAs($customer);

        $this->getJson('/api/v1/consultant/dashboard')->assertForbidden();
        $this->getJson('/api/v1/consultant/tickets')->assertForbidden();
    }

    public function test_admin_can_view_consultant_workload_and_metrics(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'active',
        ]);

        $consultantA = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        $consultantB = User::factory()->create([
            'role' => 'consultant',
            'status' => 'active',
        ]);

        DB::table('consultant_profiles')->insert([
            [
                'user_id' => $consultantA->id,
                'is_available' => true,
                'max_concurrent_tickets' => 4,
                'calendly_url' => 'https://calendly.com/a/intake',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $consultantB->id,
                'is_available' => true,
                'max_concurrent_tickets' => 8,
                'calendly_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $customer = User::factory()->create();
        $service = $this->createService();
        $property = $this->createPropertyForUser($customer);

        Ticket::create([
            'ticket_number' => 'TK-2026-10004',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultantA->id,
            'service_id' => $service->id,
            'title' => 'Consultant A active ticket',
            'priority' => 'medium',
            'status' => 'in_progress',
        ]);

        Ticket::create([
            'ticket_number' => 'TK-2026-10005',
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'consultant_id' => $consultantB->id,
            'service_id' => $service->id,
            'title' => 'Consultant B completed ticket',
            'priority' => 'medium',
            'status' => 'completed',
            'resolved_at' => now()->subDays(1),
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/consultants/workload')
            ->assertOk()
            ->assertJsonPath('data.0.id', $consultantB->id)
            ->assertJsonPath('data.0.suggestion_rank', 1);

        $this->getJson("/api/v1/consultant/metrics?consultant_id={$consultantB->id}&days=30")
            ->assertOk()
            ->assertJsonPath('data.kpis.window_days', 30)
            ->assertJsonPath('data.kpis.completed_in_window_count', 1)
            ->assertJsonPath('data.status_breakdown.completed', 1);
    }

    private function createPropertyForUser(User $user): Property
    {
        $propertyTypeId = DB::table('property_types')->insertGetId([
            'name' => 'Residential',
            'slug' => 'consultant-residential-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipStatusId = DB::table('ownership_statuses')->insertGetId([
            'name' => 'Purchased',
            'slug' => 'consultant-purchased-'.uniqid(),
            'display_label' => 'Purchased',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $ownershipTypeId = DB::table('ownership_types')->insertGetId([
            'name' => 'Sole',
            'slug' => 'consultant-sole-'.uniqid(),
            'requires_co_owners' => false,
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Property::create([
            'user_id' => $user->id,
            'property_name' => 'Consultant Property',
            'property_type_id' => $propertyTypeId,
            'ownership_status_id' => $ownershipStatusId,
            'ownership_type_id' => $ownershipTypeId,
            'status' => 'draft',
        ]);
    }

    private function createService(): Service
    {
        $categoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Consultant Category '.uniqid(),
            'slug' => 'consultant-category-'.uniqid(),
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Service::create([
            'category_id' => $categoryId,
            'name' => 'Consultant Service '.uniqid(),
            'slug' => 'consultant-service-'.uniqid(),
            'pricing_type' => 'paid',
            'price' => 20,
            'currency' => 'USD',
            'requires_meeting' => true,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);
    }
}
