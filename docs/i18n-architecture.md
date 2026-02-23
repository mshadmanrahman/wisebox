# Wisebox i18n Architecture: Option C (Hybrid)

## Overview

Database-backed translations with Redis caching, API delivery, and an admin management panel. Supports English (en) and Bangla (bn) with the ability to add more languages later.

## System Design

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ i18next   │◄──│ API Backend  │◄──│ Zustand     │ │
│  │ instance  │   │ (custom      │   │ i18n store  │ │
│  │           │   │  loader)     │   │ (language)  │ │
│  └─────┬─────┘   └──────┬───────┘   └──────┬──────┘ │
│        │                │                   │        │
│   t('key')         GET /api/v1/        setLanguage() │
│   in components    translations        on toggle     │
│                         │                            │
│  ┌──────────────────────┼────────────────────────┐   │
│  │         Admin Translation Panel               │   │
│  │   Side-by-side EN/BN editor (CRUD)            │   │
│  └──────────────────────┼────────────────────────┘   │
└─────────────────────────┼────────────────────────────┘
                          │
                     HTTP/JSON
                          │
┌─────────────────────────┼────────────────────────────┐
│                    Backend (Laravel)                   │
│                         │                             │
│  ┌──────────────────────▼───────────────────────────┐ │
│  │            TranslationController                  │ │
│  │  GET  /translations?locale=bn&ns=common           │ │
│  │  GET  /admin/translations?ns=common               │ │
│  │  PUT  /admin/translations/{id}                    │ │
│  │  POST /admin/translations                         │ │
│  └──────────────────────┬───────────────────────────┘ │
│                         │                             │
│  ┌──────────────────────▼───────────────────────────┐ │
│  │            TranslationService                     │ │
│  │  getTranslations(locale, namespace)               │ │
│  │  updateTranslation(id, value)                     │ │
│  │  invalidateCache(locale, namespace)               │ │
│  └───────┬──────────────────────────────┬───────────┘ │
│          │                              │             │
│   ┌──────▼──────┐               ┌───────▼──────┐     │
│   │  Redis 7    │               │  MySQL 8     │     │
│   │  Cache      │  ◄── miss ──► │  translations│     │
│   │  TTL: 5min  │               │  table       │     │
│   └─────────────┘               └──────────────┘     │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │            SetLocale Middleware                   │  │
│  │  Auth user profile > Accept-Language > 'en'      │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

## Database Schema

### `translations` table

```sql
CREATE TABLE translations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    locale VARCHAR(5) NOT NULL DEFAULT 'en',        -- 'en' or 'bn'
    namespace VARCHAR(50) NOT NULL DEFAULT 'common', -- matches frontend namespace
    key VARCHAR(255) NOT NULL,                       -- e.g. 'login.title'
    value TEXT NOT NULL,                             -- the translated string
    updated_by BIGINT UNSIGNED NULL,                 -- FK to users.id (audit)
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    UNIQUE INDEX idx_translations_unique (locale, namespace, `key`),
    INDEX idx_translations_locale_ns (locale, namespace)
);
```

### Namespaces

| Namespace | Scope | ~Keys |
|-----------|-------|-------|
| `common` | Nav, pagination, loading, retry, error, footer | 40 |
| `auth` | Login, register, forgot-password, OTP | 35 |
| `dashboard` | Greeting, guide cards, CTA | 25 |
| `properties` | List, detail, create/edit, documents, co-owners | 45 |
| `tickets` | List, detail, comments, status badges | 30 |
| `orders` | List, detail, checkout, payment status | 20 |
| `settings` | Tabs, profile form, password, preferences | 30 |
| `notifications` | Notification center, empty state | 10 |
| `consultant` | Cases, ticket detail, forms | 25 |
| `admin` | Dashboard, consultations, learning mgmt | 25 |
| `forms` | Dynamic forms, validation, actions | 15 |

**Total**: ~300 keys x 2 locales = ~600 rows

## Backend Implementation

### Migration

```php
// database/migrations/xxxx_create_translations_table.php

Schema::create('translations', function (Blueprint $table) {
    $table->id();
    $table->string('locale', 5)->default('en');
    $table->string('namespace', 50)->default('common');
    $table->string('key', 255);
    $table->text('value');
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();

    $table->unique(['locale', 'namespace', 'key']);
    $table->index(['locale', 'namespace']);
});
```

### Translation Model

```php
// app/Models/Translation.php

class Translation extends Model
{
    protected $fillable = ['locale', 'namespace', 'key', 'value', 'updated_by'];

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
```

### TranslationService (Cache Layer)

```php
// app/Services/TranslationService.php

class TranslationService
{
    private const CACHE_TTL = 300; // 5 minutes
    private const CACHE_PREFIX = 'i18n';

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

        return $translation;
    }

    public function invalidateCache(string $locale, string $namespace): void
    {
        Cache::forget(self::CACHE_PREFIX . ":{$locale}:{$namespace}");
    }

    public function invalidateAll(): void
    {
        $locales = ['en', 'bn'];
        $namespaces = ['common', 'auth', 'dashboard', 'properties', 'tickets',
                       'orders', 'settings', 'notifications', 'consultant', 'admin', 'forms'];

        foreach ($locales as $locale) {
            foreach ($namespaces as $ns) {
                Cache::forget(self::CACHE_PREFIX . ":{$locale}:{$ns}");
            }
        }
    }
}
```

### API Endpoints

```php
// routes/api.php

// Public: fetch translations for a locale + namespace
Route::get('/translations', [TranslationController::class, 'index']);

// Admin: manage translations (requires admin/super_admin role)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/translations', [TranslationController::class, 'adminIndex']);
    Route::put('/translations/{id}', [TranslationController::class, 'update']);
    Route::post('/translations', [TranslationController::class, 'store']);
});
```

### TranslationController

```php
// app/Http/Controllers/Api/V1/TranslationController.php

class TranslationController extends Controller
{
    public function __construct(private TranslationService $service) {}

    // Public: GET /api/v1/translations?locale=bn&ns=common
    // Returns { "login.title": "আবার স্বাগতম", "login.submit": "সাইন ইন", ... }
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => ['required', 'in:en,bn'],
            'ns' => ['required', 'string', 'max:50'],
        ]);

        $translations = $this->service->getTranslations(
            $request->input('locale'),
            $request->input('ns')
        );

        return response()->json($translations);
    }

    // Admin: GET /api/v1/admin/translations?ns=common&search=login
    // Returns paginated list with both EN and BN side by side
    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $query = Translation::where('locale', 'en');

        if ($ns = $request->input('ns')) {
            $query->where('namespace', $ns);
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%");
            });
        }

        $enTranslations = $query->orderBy('namespace')->orderBy('key')->paginate(50);

        // Attach Bengali counterparts
        $bnMap = Translation::where('locale', 'bn')
            ->whereIn('key', $enTranslations->pluck('key'))
            ->whereIn('namespace', $enTranslations->pluck('namespace')->unique())
            ->get()
            ->keyBy(fn ($t) => "{$t->namespace}.{$t->key}");

        $items = $enTranslations->through(function ($en) use ($bnMap) {
            $bnKey = "{$en->namespace}.{$en->key}";
            $bn = $bnMap->get($bnKey);
            return [
                'key' => $en->key,
                'namespace' => $en->namespace,
                'en' => ['id' => $en->id, 'value' => $en->value, 'updated_at' => $en->updated_at],
                'bn' => $bn ? ['id' => $bn->id, 'value' => $bn->value, 'updated_at' => $bn->updated_at] : null,
            ];
        });

        return response()->json($items);
    }

    // Admin: PUT /api/v1/admin/translations/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $this->authorize('admin');

        $request->validate(['value' => ['required', 'string']]);

        $translation = $this->service->updateTranslation(
            $id,
            $request->input('value'),
            $request->user()->id
        );

        return response()->json(['data' => $translation]);
    }

    // Admin: POST /api/v1/admin/translations
    public function store(Request $request): JsonResponse
    {
        $this->authorize('admin');

        $request->validate([
            'locale' => ['required', 'in:en,bn'],
            'namespace' => ['required', 'string', 'max:50'],
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
        ]);

        $translation = Translation::create([
            ...$request->only(['locale', 'namespace', 'key', 'value']),
            'updated_by' => $request->user()->id,
        ]);

        $this->service->invalidateCache($request->input('locale'), $request->input('namespace'));

        return response()->json(['data' => $translation], 201);
    }

    private function authorize(string $role): void
    {
        $user = request()->user();
        if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, __('messages.forbidden'));
        }
    }
}
```

### SetLocale Middleware

```php
// app/Http/Middleware/SetLocale.php

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en';

        // Priority 1: Authenticated user's profile preference
        if ($user = $request->user()) {
            $profileLang = $user->profile?->preferred_language;
            if ($profileLang && in_array($profileLang, ['en', 'bn'], true)) {
                $locale = $profileLang;
            }
        }

        // Priority 2: Accept-Language header (for unauthenticated requests)
        if (!$user) {
            $headerLang = $request->header('Accept-Language');
            if ($headerLang && in_array($headerLang, ['en', 'bn'], true)) {
                $locale = $headerLang;
            }
        }

        App::setLocale($locale);

        return $next($request);
    }
}
```

### Seeder

```php
// database/seeders/TranslationSeeder.php

// Seeds all ~300 EN keys and ~300 BN keys from a structured array.
// Each namespace has its own section.
// Run: php artisan db:seed --class=TranslationSeeder
```

### Backend i18n for Emails/Notifications

Controllers and notifications continue using Laravel's `__()` helper, but the `__()` function is configured to **also** look up from the `translations` table via a custom TranslationLoader (or the lang files are kept in sync with the DB via artisan command). Simpler approach: keep `lang/en/` and `lang/bn/` PHP files for backend-only strings (email content, validation messages, API responses) and use the `translations` DB table for frontend-facing strings only.

**Two translation systems, cleanly separated:**

| System | Source | Consumer | Managed by |
|--------|--------|----------|-----------|
| DB `translations` table | MySQL + Redis | Frontend (via API) | Admin panel |
| `lang/{en,bn}/*.php` files | PHP files | Backend (__() in controllers, notifications, emails) | Developers (code deploy) |

This avoids overcomplicating the backend. Admin panel manages what users see in the UI. Developer-managed PHP files handle what the server sends in emails and API responses.

## Frontend Implementation

### i18n Configuration with Custom API Backend

```typescript
// src/lib/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import api from '@/lib/api';

// Custom backend that fetches from our API
const ApiBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: any, data: any) => void) {
    api.get('/translations', { params: { locale: language, ns: namespace } })
      .then((res) => callback(null, res.data))
      .catch((err) => {
        console.warn(`Failed to load ${language}/${namespace} translations, using fallback`);
        callback(err, null);
      });
  },
};

i18n
  .use(ApiBackend)
  .use(initReactI18next)
  .init({
    lng: undefined,           // Set by I18nProvider from Zustand
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn'],
    ns: ['common', 'auth', 'dashboard', 'properties', 'tickets',
         'orders', 'settings', 'notifications', 'consultant', 'admin', 'forms'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
```

### Zustand i18n Store

```typescript
// src/stores/i18n.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';

type Language = 'en' | 'bn';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  syncFromProfile: (profileLang: Language | undefined) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      syncFromProfile: (profileLang) => {
        const lang = profileLang ?? 'en';
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    { name: 'wisebox-i18n', partialize: (state) => ({ language: state.language }) }
  )
);
```

### Language Switcher Component

Globe icon dropdown in portal header. Calls `setLanguage()` + PATCHes `/auth/me` with `preferred_language`.

### Admin Translation Panel

Located at `/admin/translations`. Features:
- Namespace filter dropdown
- Search box (filters by key or value)
- Table with columns: Key | English | Bangla | Last Updated
- Inline editing: click a cell to edit, save on blur/Enter
- Paginated (50 per page)
- Uses TanStack Query for data fetching + optimistic updates

## Caching Strategy

### Redis Cache

- **Key format**: `i18n:{locale}:{namespace}` (e.g., `i18n:bn:common`)
- **TTL**: 5 minutes (self-healing if invalidation fails)
- **Invalidation**: On admin edit, delete the specific cache key
- **Warmup**: Optional artisan command to pre-populate cache after deploy

### Frontend Cache (TanStack Query)

- **staleTime**: 5 minutes (matches Redis TTL)
- **cacheTime**: 30 minutes (keep in memory longer)
- **Pattern**: Stale-while-revalidate. User sees cached translations instantly; fresh data loads in background.

### Fallback Chain

```
1. TanStack Query in-memory cache (instant, ~0ms)
2. Redis cache (fast, ~1ms)
3. MySQL database (slower, ~5-10ms)
4. Hardcoded English fallback in i18next (if API fails entirely)
```

## Testing Strategy

### Backend (PHPUnit)

| Test | What it validates |
|------|-------------------|
| `LocaleMiddlewareTest` | Auth user preference sets locale; Accept-Language fallback; default English |
| `TranslationServiceTest` | Cache hit returns cached data; cache miss queries DB; invalidation clears cache |
| `TranslationControllerTest` | Public GET returns translations; admin CRUD works; auth required for admin |
| `LocalizedResponsesTest` | API error messages come back in Bengali when locale is bn |
| `LocalizedEmailTest` | Notifications render in user's preferred language |

### Frontend (Playwright E2E)

| Test | What it validates |
|------|-------------------|
| Language switching | Toggle EN to BN, UI strings change; toggle back, strings revert |
| Persistence | Switch to BN, refresh page, language stays BN |
| Profile sync | Login as user with preferred_language=bn, UI auto-switches |
| Admin panel | Edit a translation, verify change appears on customer portal |
| Fallback | If API fails, English fallback strings are shown |

## Migration Path

1. Create `translations` table (migration)
2. Seed all ~600 rows (300 EN + 300 BN)
3. Deploy backend (API + middleware + seeder)
4. Deploy frontend (i18n library + language switcher + string extraction)
5. Admin verifies translations via panel
6. Bengali native speaker reviews and corrects translations via admin panel
