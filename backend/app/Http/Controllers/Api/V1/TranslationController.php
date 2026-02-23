<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    public function __construct(private TranslationService $service)
    {
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            if (!$user || !in_array($user->role, ['admin', 'super_admin'])) {
                abort(403, __('messages.forbidden'));
            }
            return $next($request);
        })->only(['adminIndex', 'update', 'store']);
    }

    /**
     * Public: GET /api/v1/translations?locale=bn&ns=common
     * Returns flat key-value map for a locale + namespace.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'in:en,bn'],
            'ns' => ['required', 'in:common,auth,dashboard,properties,tickets,orders,settings,notifications,consultant,admin,forms'],
        ]);

        $translations = $this->service->getTranslations(
            $validated['locale'],
            $validated['ns']
        );

        return response()->json($translations);
    }

    /**
     * Admin: GET /api/v1/admin/translations?ns=common&search=login
     * Returns paginated list with both EN and BN side by side.
     */
    public function adminIndex(Request $request): JsonResponse
    {
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
                'en' => [
                    'id' => $en->id,
                    'value' => $en->value,
                    'updated_at' => $en->updated_at,
                ],
                'bn' => $bn ? [
                    'id' => $bn->id,
                    'value' => $bn->value,
                    'updated_at' => $bn->updated_at,
                ] : null,
            ];
        });

        return response()->json($items);
    }

    /**
     * Admin: PUT /api/v1/admin/translations/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'value' => ['required', 'string'],
        ]);

        $translation = $this->service->updateTranslation(
            $id,
            $validated['value'],
            $request->user()->id
        );

        return response()->json(['data' => $translation]);
    }

    /**
     * Admin: POST /api/v1/admin/translations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'in:en,bn'],
            'namespace' => ['required', 'in:common,auth,dashboard,properties,tickets,orders,settings,notifications,consultant,admin,forms'],
            'key' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string'],
        ]);

        $translation = $this->service->createTranslation(
            $validated,
            $request->user()->id
        );

        return response()->json(['data' => $translation], 201);
    }
}
