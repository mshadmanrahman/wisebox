<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InAppNotification;
use App\Models\Property;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $sliders = DB::table('sliders')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

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
                    'tickets_total' => (clone $ticketsBaseQuery)->count(),
                    'tickets_open' => (clone $ticketsBaseQuery)->whereIn('status', $ticketOpenStatuses)->count(),
                ],
            ],
        ]);
    }
}
