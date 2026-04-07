<?php

namespace Tests\Feature;

use App\Models\Translation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TranslationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Clear translations seeded by migrations so each test starts clean.
        // The seeder migrations populate hundreds of rows that conflict with
        // the specific Translation::create() calls in each test method.
        Translation::query()->delete();
    }

    public function test_public_endpoint_returns_translations_for_locale_and_namespace(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'Home']);
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.settings', 'value' => 'Settings']);
        Translation::create(['locale' => 'bn', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'হোম']);
        Translation::create(['locale' => 'en', 'namespace' => 'auth', 'key' => 'login.title', 'value' => 'Welcome back']);

        $response = $this->getJson('/api/v1/translations?locale=en&ns=common');

        $response->assertOk()
            ->assertJsonCount(2)
            ->assertJson([
                'nav.home' => 'Home',
                'nav.settings' => 'Settings',
            ]);
    }

    public function test_public_endpoint_returns_bangla_translations(): void
    {
        Translation::create(['locale' => 'bn', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'হোম']);
        Translation::create(['locale' => 'bn', 'namespace' => 'common', 'key' => 'loading', 'value' => 'লোড হচ্ছে...']);

        $response = $this->getJson('/api/v1/translations?locale=bn&ns=common');

        $response->assertOk()
            ->assertJson([
                'nav.home' => 'হোম',
                'loading' => 'লোড হচ্ছে...',
            ]);
    }

    public function test_public_endpoint_rejects_invalid_namespace(): void
    {
        $this->getJson('/api/v1/translations?locale=en&ns=nonexistent')
            ->assertUnprocessable();
    }

    public function test_public_endpoint_returns_empty_for_namespace_with_no_data(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'Home']);

        $response = $this->getJson('/api/v1/translations?locale=en&ns=auth');

        $response->assertOk()
            ->assertJsonCount(0);
    }

    public function test_public_endpoint_validates_locale(): void
    {
        $this->getJson('/api/v1/translations?locale=fr&ns=common')
            ->assertUnprocessable();
    }

    public function test_public_endpoint_requires_locale_and_ns(): void
    {
        $this->getJson('/api/v1/translations')
            ->assertUnprocessable();

        $this->getJson('/api/v1/translations?locale=en')
            ->assertUnprocessable();
    }

    public function test_admin_can_list_translations_with_bn_counterparts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'Home']);
        Translation::create(['locale' => 'bn', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'হোম']);
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'loading', 'value' => 'Loading...']);

        $response = $this->getJson('/api/v1/admin/translations?ns=common');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertCount(2, $data);

        // First item should have both en and bn
        $homeItem = collect($data)->firstWhere('key', 'nav.home');
        $this->assertNotNull($homeItem);
        $this->assertEquals('Home', $homeItem['en']['value']);
        $this->assertEquals('হোম', $homeItem['bn']['value']);

        // Second item should have en but no bn
        $loadingItem = collect($data)->firstWhere('key', 'loading');
        $this->assertNotNull($loadingItem);
        $this->assertEquals('Loading...', $loadingItem['en']['value']);
        $this->assertNull($loadingItem['bn']);
    }

    public function test_admin_can_search_translations(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'Home']);
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.settings', 'value' => 'Settings']);
        Translation::create(['locale' => 'en', 'namespace' => 'auth', 'key' => 'login.title', 'value' => 'Welcome back']);

        $response = $this->getJson('/api/v1/admin/translations?search=nav');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(2, $data);
    }

    public function test_admin_can_update_translation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $translation = Translation::create([
            'locale' => 'bn',
            'namespace' => 'common',
            'key' => 'nav.home',
            'value' => 'হোম',
        ]);

        $response = $this->putJson("/api/v1/admin/translations/{$translation->id}", [
            'value' => 'প্রধান পাতা',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.value', 'প্রধান পাতা')
            ->assertJsonPath('data.updated_by', $admin->id);
    }

    public function test_admin_can_create_translation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/translations', [
            'locale' => 'bn',
            'namespace' => 'common',
            'key' => 'new.key',
            'value' => 'নতুন মান',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.locale', 'bn')
            ->assertJsonPath('data.namespace', 'common')
            ->assertJsonPath('data.key', 'new.key')
            ->assertJsonPath('data.value', 'নতুন মান');

        $this->assertDatabaseHas('translations', [
            'locale' => 'bn',
            'namespace' => 'common',
            'key' => 'new.key',
            'value' => 'নতুন মান',
        ]);
    }

    public function test_non_admin_cannot_access_admin_endpoints(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);

        $this->getJson('/api/v1/admin/translations')
            ->assertForbidden();

        $this->postJson('/api/v1/admin/translations', [
            'locale' => 'en',
            'namespace' => 'common',
            'key' => 'test',
            'value' => 'test',
        ])->assertForbidden();
    }

    public function test_unauthenticated_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/v1/admin/translations')
            ->assertUnauthorized();
    }

    public function test_super_admin_can_access_admin_endpoints(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($superAdmin);

        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'test', 'value' => 'Test']);

        $this->getJson('/api/v1/admin/translations')
            ->assertOk();
    }
}
