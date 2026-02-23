<?php

namespace Tests\Unit;

use App\Models\Translation;
use App\Models\User;
use App\Services\TranslationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class TranslationServiceTest extends TestCase
{
    use RefreshDatabase;

    private TranslationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TranslationService();
    }

    public function test_get_translations_returns_key_value_array(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'nav.home', 'value' => 'Home']);
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'loading', 'value' => 'Loading...']);

        $result = $this->service->getTranslations('en', 'common');

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals('Home', $result['nav.home']);
        $this->assertEquals('Loading...', $result['loading']);
    }

    public function test_get_translations_caches_results(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'test', 'value' => 'Original']);

        // First call populates cache
        $result1 = $this->service->getTranslations('en', 'common');
        $this->assertEquals('Original', $result1['test']);

        // Modify DB directly (bypassing cache)
        Translation::where('key', 'test')->update(['value' => 'Modified']);

        // Second call should return cached result
        $result2 = $this->service->getTranslations('en', 'common');
        $this->assertEquals('Original', $result2['test']);
    }

    public function test_invalidate_cache_clears_specific_key(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'test', 'value' => 'Original']);

        // Populate cache
        $this->service->getTranslations('en', 'common');

        // Modify DB
        Translation::where('key', 'test')->update(['value' => 'Modified']);

        // Invalidate
        $this->service->invalidateCache('en', 'common');

        // Should fetch fresh from DB
        $result = $this->service->getTranslations('en', 'common');
        $this->assertEquals('Modified', $result['test']);
    }

    public function test_update_translation_modifies_value_and_clears_cache(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $translation = Translation::create([
            'locale' => 'en',
            'namespace' => 'common',
            'key' => 'test',
            'value' => 'Original',
        ]);

        // Populate cache
        $this->service->getTranslations('en', 'common');

        // Update
        $updated = $this->service->updateTranslation($translation->id, 'Updated', $admin->id);

        $this->assertEquals('Updated', $updated->value);
        $this->assertEquals($admin->id, $updated->updated_by);

        // Cache should be invalidated; fresh fetch should reflect update
        $result = $this->service->getTranslations('en', 'common');
        $this->assertEquals('Updated', $result['test']);
    }

    public function test_create_translation_adds_entry_and_clears_cache(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Populate cache (empty)
        $this->service->getTranslations('en', 'common');

        // Create
        $translation = $this->service->createTranslation([
            'locale' => 'en',
            'namespace' => 'common',
            'key' => 'new.key',
            'value' => 'New Value',
        ], $admin->id);

        $this->assertEquals('en', $translation->locale);
        $this->assertEquals('common', $translation->namespace);
        $this->assertEquals('new.key', $translation->key);
        $this->assertEquals('New Value', $translation->value);

        // Cache invalidated; fresh fetch includes new key
        $result = $this->service->getTranslations('en', 'common');
        $this->assertArrayHasKey('new.key', $result);
        $this->assertEquals('New Value', $result['new.key']);
    }

    public function test_invalidate_all_clears_all_locale_namespace_combinations(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'a', 'value' => 'A']);
        Translation::create(['locale' => 'bn', 'namespace' => 'auth', 'key' => 'b', 'value' => 'B']);

        // Populate caches
        $this->service->getTranslations('en', 'common');
        $this->service->getTranslations('bn', 'auth');

        // Verify they're cached
        $this->assertTrue(Cache::has('i18n:en:common'));
        $this->assertTrue(Cache::has('i18n:bn:auth'));

        // Invalidate all
        $this->service->invalidateAll();

        $this->assertFalse(Cache::has('i18n:en:common'));
        $this->assertFalse(Cache::has('i18n:bn:auth'));
    }

    public function test_different_namespaces_are_cached_independently(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'key', 'value' => 'Common']);
        Translation::create(['locale' => 'en', 'namespace' => 'auth', 'key' => 'key', 'value' => 'Auth']);

        $common = $this->service->getTranslations('en', 'common');
        $auth = $this->service->getTranslations('en', 'auth');

        $this->assertEquals('Common', $common['key']);
        $this->assertEquals('Auth', $auth['key']);

        // Invalidate only common
        $this->service->invalidateCache('en', 'common');

        // Auth should still be cached
        $this->assertTrue(Cache::has('i18n:en:auth'));
    }

    public function test_warm_cache_populates_all_caches(): void
    {
        Translation::create(['locale' => 'en', 'namespace' => 'common', 'key' => 'a', 'value' => 'A']);
        Translation::create(['locale' => 'bn', 'namespace' => 'common', 'key' => 'a', 'value' => 'ক']);

        $count = $this->service->warmCache();

        $this->assertEquals(2, $count);
        $this->assertTrue(Cache::has('i18n:en:common'));
        $this->assertTrue(Cache::has('i18n:bn:common'));
    }
}
