<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ServiceCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_services_endpoint_returns_active_sorted_services(): void
    {
        $legalCategoryId = $this->createCategory('Legal', 'legal', true, 1);

        $this->createService($legalCategoryId, [
            'name' => 'Inactive Service',
            'slug' => 'inactive-service',
            'pricing_type' => 'paid',
            'is_active' => false,
            'sort_order' => 0,
        ]);

        $this->createService($legalCategoryId, [
            'name' => 'Second Active',
            'slug' => 'second-active',
            'pricing_type' => 'paid',
            'sort_order' => 2,
        ]);

        $this->createService($legalCategoryId, [
            'name' => 'First Active',
            'slug' => 'first-active',
            'pricing_type' => 'free',
            'sort_order' => 1,
        ]);

        $this->getJson('/api/v1/services')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'first-active')
            ->assertJsonPath('data.1.slug', 'second-active');
    }

    public function test_services_endpoint_supports_filters_and_search(): void
    {
        $legalCategoryId = $this->createCategory('Legal', 'legal', true, 1);
        $surveyCategoryId = $this->createCategory('Survey', 'survey', true, 2);

        $this->createService($legalCategoryId, [
            'name' => 'Land Mutation Assistance',
            'slug' => 'land-mutation-assistance',
            'short_description' => 'Mutation filing support',
            'pricing_type' => 'physical',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $this->createService($legalCategoryId, [
            'name' => 'Document Review',
            'slug' => 'document-review',
            'short_description' => 'Legal review of docs',
            'pricing_type' => 'paid',
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        $this->createService($surveyCategoryId, [
            'name' => 'Plot Measurement',
            'slug' => 'plot-measurement',
            'short_description' => 'On-site survey',
            'pricing_type' => 'physical',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $this->getJson('/api/v1/services?category_slug=legal&pricing_type=physical&featured=1&q=mutation')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'land-mutation-assistance');
    }

    public function test_services_endpoint_supports_pagination_when_per_page_is_present(): void
    {
        $categoryId = $this->createCategory('General', 'general', true, 1);

        $this->createService($categoryId, [
            'name' => 'Service One',
            'slug' => 'service-one',
            'pricing_type' => 'free',
            'sort_order' => 1,
        ]);

        $this->createService($categoryId, [
            'name' => 'Service Two',
            'slug' => 'service-two',
            'pricing_type' => 'paid',
            'sort_order' => 2,
        ]);

        $this->createService($categoryId, [
            'name' => 'Service Three',
            'slug' => 'service-three',
            'pricing_type' => 'physical',
            'sort_order' => 3,
        ]);

        $this->getJson('/api/v1/services?per_page=2')
            ->assertOk()
            ->assertJsonPath('per_page', 2)
            ->assertJsonPath('total', 3)
            ->assertJsonCount(2, 'data');
    }

    public function test_public_service_categories_endpoint_returns_active_sorted_categories(): void
    {
        $this->createCategory('Inactive', 'inactive-category', false, 0);
        $this->createCategory('Second Category', 'second-category', true, 2);
        $this->createCategory('First Category', 'first-category', true, 1);

        $this->getJson('/api/v1/service-categories')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'first-category')
            ->assertJsonPath('data.1.slug', 'second-category');
    }

    private function createCategory(string $name, string $slug, bool $isActive, int $sortOrder): int
    {
        return DB::table('service_categories')->insertGetId([
            'name' => $name,
            'slug' => $slug,
            'description' => null,
            'icon' => null,
            'is_active' => $isActive,
            'sort_order' => $sortOrder,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createService(int $categoryId, array $overrides = []): Service
    {
        return Service::create(array_merge([
            'category_id' => $categoryId,
            'name' => 'Default Service',
            'slug' => 'default-service-'.uniqid(),
            'description' => 'Default description',
            'short_description' => 'Default short description',
            'pricing_type' => 'paid',
            'price' => 49.00,
            'currency' => 'USD',
            'stripe_price_id' => null,
            'estimated_duration_minutes' => 60,
            'requires_meeting' => true,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
            'icon' => 'briefcase',
        ], $overrides));
    }
}

