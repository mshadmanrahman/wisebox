<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NotificationController extends Controller
{
    private const UNREAD_COUNT_CACHE_TTL_SECONDS = 30;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'status' => ['nullable', 'in:all,read,unread'],
            'type' => ['nullable', 'string', 'max:191'],
            'q' => ['nullable', 'string', 'max:255'],
        ]);

        $notifications = InAppNotification::query()
            ->where('user_id', $request->user()->id)
            ->when(($validated['status'] ?? 'all') === 'read', fn ($query) => $query->whereNotNull('read_at'))
            ->when(($validated['status'] ?? 'all') === 'unread', fn ($query) => $query->whereNull('read_at'))
            ->when(!empty($validated['type']), fn ($query) => $query->where('type', $validated['type']))
            ->when(!empty($validated['q']), function ($query) use ($validated) {
                $term = '%'.$validated['q'].'%';
                $query->where(function ($search) use ($term) {
                    $search->where('title', 'like', $term)
                        ->orWhere('body', 'like', $term);
                });
            })
            ->orderByDesc('created_at')
            ->paginate((int) ($validated['per_page'] ?? 20));

        return response()->json($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $count = Cache::remember(
            $this->unreadCountCacheKey($userId),
            now()->addSeconds(self::UNREAD_COUNT_CACHE_TTL_SECONDS),
            static fn () => InAppNotification::query()
                ->where('user_id', $userId)
                ->whereNull('read_at')
                ->count()
        );

        return response()->json([
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $notification = InAppNotification::query()
            ->where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
            $this->forgetUnreadCountCache($userId);
        }

        return response()->json([
            'data' => $notification->fresh(),
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        $markedCount = InAppNotification::query()
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($markedCount > 0) {
            $this->forgetUnreadCountCache($userId);
        }

        return response()->json([
            'data' => [
                'marked_count' => $markedCount,
            ],
            'message' => 'All notifications marked as read.',
        ]);
    }

    private function unreadCountCacheKey(int $userId): string
    {
        return "notifications:user:{$userId}:unread-count";
    }

    private function forgetUnreadCountCache(int $userId): void
    {
        Cache::forget($this->unreadCountCacheKey($userId));
    }
}
