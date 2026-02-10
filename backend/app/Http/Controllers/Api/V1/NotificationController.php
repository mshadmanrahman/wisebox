<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
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
        $count = InAppNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        $notification = InAppNotification::query()
            ->where('id', $notificationId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if ($notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'data' => $notification->fresh(),
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $markedCount = InAppNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => [
                'marked_count' => $markedCount,
            ],
            'message' => 'All notifications marked as read.',
        ]);
    }
}
