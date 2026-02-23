<?php

namespace App\Services;

use App\Models\Translation;
use Illuminate\Support\Facades\Cache;

class TranslationService
{
    private const CACHE_TTL = 300; // 5 minutes

    private const CACHE_PREFIX = 'i18n';

    private const SUPPORTED_NAMESPACES = [
        'common', 'auth', 'dashboard', 'properties', 'tickets',
        'orders', 'settings', 'notifications', 'consultant', 'admin', 'forms',
    ];

    public function getTranslations(string $locale, string $namespace): array
    {
        $cacheKey = self::CACHE_PREFIX . ":{$locale}:{$namespace}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($locale, $namespace) {
            return Translation::where('locale', $locale)
                ->where('namespace', $namespace)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public function updateTranslation(int $id, string $value, int $userId): Translation
    {
        $translation = Translation::findOrFail($id);

        $translation->update([
            'value' => $value,
            'updated_by' => $userId,
        ]);

        $this->invalidateCache($translation->locale, $translation->namespace);

        return $translation->fresh();
    }

    public function createTranslation(array $data, int $userId): Translation
    {
        $translation = Translation::create([
            'locale' => $data['locale'],
            'namespace' => $data['namespace'],
            'key' => $data['key'],
            'value' => $data['value'],
            'updated_by' => $userId,
        ]);

        $this->invalidateCache($data['locale'], $data['namespace']);

        return $translation;
    }

    public function invalidateCache(string $locale, string $namespace): void
    {
        Cache::forget(self::CACHE_PREFIX . ":{$locale}:{$namespace}");
    }

    public function invalidateAll(): void
    {
        $locales = ['en', 'bn'];

        foreach ($locales as $locale) {
            foreach (self::SUPPORTED_NAMESPACES as $ns) {
                Cache::forget(self::CACHE_PREFIX . ":{$locale}:{$ns}");
            }
        }
    }

    public function warmCache(): int
    {
        $count = 0;
        $locales = ['en', 'bn'];

        foreach ($locales as $locale) {
            foreach (self::SUPPORTED_NAMESPACES as $ns) {
                $translations = $this->getTranslations($locale, $ns);
                $count += count($translations);
            }
        }

        return $count;
    }
}
