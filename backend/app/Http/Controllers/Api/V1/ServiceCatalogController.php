<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceCatalogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'category_slug' => ['nullable', 'string', 'max:100'],
            'pricing_type' => ['nullable', Rule::in(['free', 'paid', 'physical'])],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', Rule::in(['recommended', 'price_low', 'price_high', 'name_asc', 'name_desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Service::query()
            ->with('category:id,name,slug')
            ->active();

        if (!empty($validated['q'])) {
            $search = trim((string) $validated['q']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if (!empty($validated['category_slug'])) {
            $categorySlug = (string) $validated['category_slug'];
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if (!empty($validated['pricing_type'])) {
            $query->where('pricing_type', $validated['pricing_type']);
        }

        if (array_key_exists('featured', $validated)) {
            $query->where('is_featured', (bool) $validated['featured']);
        }

        $sort = (string) ($validated['sort'] ?? 'recommended');
        if ($sort === 'price_low') {
            $query->orderBy('price')->orderBy('sort_order')->orderBy('id');
        } elseif ($sort === 'price_high') {
            $query->orderByDesc('price')->orderBy('sort_order')->orderBy('id');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('name')->orderBy('id');
        } elseif ($sort === 'name_desc') {
            $query->orderByDesc('name')->orderBy('id');
        } else {
            $query->orderBy('sort_order')->orderBy('id');
        }

        if (!empty($validated['per_page'])) {
            $services = $query->paginate((int) $validated['per_page']);

            return response()->json($services);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function categories(): JsonResponse
    {
        $categories = ServiceCategory::query()
            ->where('is_active', true)
            ->withCount([
                'services as active_services_count' => function ($query) {
                    $query->where('is_active', true);
                },
            ])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json(['data' => $categories]);
    }
}
