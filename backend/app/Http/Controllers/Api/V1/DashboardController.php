<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use App\Models\Property;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    private const HERO_SLIDES_CACHE_KEY = 'dashboard:hero-slides:v1';

    private const HERO_SLIDES_CACHE_TTL_SECONDS = 300;

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $sliders = Cache::remember(
            self::HERO_SLIDES_CACHE_KEY,
            now()->addSeconds(self::HERO_SLIDES_CACHE_TTL_SECONDS),
            static fn () => DB::table('sliders')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
        );
        $sliders = $this->sanitizeSlides($sliders);

        $properties = Property::query()
            ->where('user_id', $user->id)
            ->with(['propertyType', 'ownershipStatus', 'ownershipType', 'division', 'district'])
            ->latest()
            ->limit(3)
            ->get();

        $ticketsBaseQuery = Ticket::query();

        if ($user->isAdmin()) {
            // Admins can see aggregate ticket data across the workspace.
        } elseif ($user->isConsultant()) {
            $ticketsBaseQuery->where('consultant_id', $user->id);
        } else {
            // Default to strict customer scoping for any non-admin/non-consultant role.
            $ticketsBaseQuery->where('customer_id', $user->id);
        }

        $ticketsPreview = (clone $ticketsBaseQuery)
            ->with(['property:id,property_name'])
            ->latest()
            ->limit(5)
            ->get();

        $ticketOpenStatuses = ['open', 'assigned', 'in_progress', 'awaiting_customer', 'awaiting_consultant', 'scheduled'];
        $ticketOpenStatusBindings = implode(', ', array_fill(0, count($ticketOpenStatuses), '?'));

        $ticketStats = (clone $ticketsBaseQuery)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status IN ({$ticketOpenStatusBindings}) THEN 1 ELSE 0 END) as open_total", $ticketOpenStatuses)
            ->first();

        $notifications = InAppNotification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $unreadCount = InAppNotification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => [
                'hero_slides' => $sliders,
                'properties_preview' => $properties,
                'tickets_preview' => $ticketsPreview,
                'notifications_preview' => $notifications,
                'unread_notifications_count' => $unreadCount,
                'counts' => [
                    'properties_total' => Property::query()->where('user_id', $user->id)->count(),
                    'tickets_total' => (int) ($ticketStats->total ?? 0),
                    'tickets_open' => (int) ($ticketStats->open_total ?? 0),
                ],
            ],
        ]);
    }

    /**
     * @param  Collection<int, object>  $slides
     * @return Collection<int, object>
     */
    private function sanitizeSlides(Collection $slides): Collection
    {
        return $slides->map(function (object $slide): object {
            if (property_exists($slide, 'cta_url')) {
                $slide->cta_url = $this->sanitizeCtaUrl($slide->cta_url);
            }

            return $slide;
        });
    }

    private function sanitizeCtaUrl(mixed $rawUrl): ?string
    {
        if (! is_string($rawUrl)) {
            return null;
        }

        $value = trim($rawUrl);

        if ($value === '') {
            return null;
        }

        if (str_starts_with($value, '/')) {
            return $this->normalizeLocalPath($value);
        }

        if (! preg_match('/^https?:\/\//i', $value)) {
            if (preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i', $value, $matches) === 1) {
                return $this->normalizeLocalPath((string) ($matches[3] ?? ''));
            }

            return null;
        }

        $parsed = parse_url($value);
        if ($parsed === false || ! isset($parsed['host'])) {
            return null;
        }

        $host = strtolower((string) $parsed['host']);
        if (! in_array($host, ['localhost', '127.0.0.1'], true)) {
            return $value;
        }

        $path = (string) ($parsed['path'] ?? '');
        if (isset($parsed['query']) && $parsed['query'] !== '') {
            $path .= '?'.$parsed['query'];
        }
        if (isset($parsed['fragment']) && $parsed['fragment'] !== '') {
            $path .= '#'.$parsed['fragment'];
        }

        return $this->normalizeLocalPath($path);
    }

    private function normalizeLocalPath(string $path): ?string
    {
        $value = trim($path);
        if ($value === '' || $value === '/' || preg_match('/^\/localhost\/?$/i', $value) === 1) {
            return null;
        }

        return str_starts_with($value, '/') ? $value : '/'.ltrim($value, '/');
    }
}
