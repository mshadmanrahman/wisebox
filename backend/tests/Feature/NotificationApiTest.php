<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_and_mark_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $notificationOne = (string) Str::uuid();
        $notificationTwo = (string) Str::uuid();

        DB::table('notifications')->insert([
            [
                'id' => $notificationOne,
                'user_id' => $user->id,
                'type' => 'ticket.assigned',
                'title' => 'Assigned',
                'body' => 'Ticket assigned to you.',
                'data' => json_encode(['ticket_id' => 1], JSON_UNESCAPED_SLASHES),
                'read_at' => null,
                'created_at' => now()->subMinute(),
            ],
            [
                'id' => $notificationTwo,
                'user_id' => $user->id,
                'type' => 'ticket.comment.added',
                'title' => 'Comment',
                'body' => 'A new comment was posted.',
                'data' => json_encode(['ticket_id' => 2], JSON_UNESCAPED_SLASHES),
                'read_at' => null,
                'created_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $otherUser->id,
                'type' => 'order.paid',
                'title' => 'Paid',
                'body' => 'Order paid.',
                'data' => null,
                'read_at' => null,
                'created_at' => now(),
            ],
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 2);

        $this->getJson('/api/v1/notifications?per_page=10')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->patchJson("/api/v1/notifications/{$notificationOne}/read")
            ->assertOk()
            ->assertJsonPath('data.id', $notificationOne);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notificationOne,
            'read_at' => null,
        ]);

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 1);

        $this->patchJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.marked_count', 1);

        $this->getJson('/api/v1/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('data.unread_count', 0);
    }

    public function test_notification_filters_search_and_pagination_work(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        DB::table('notifications')->insert([
            [
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'type' => 'ticket.assigned',
                'title' => 'Assigned to consultant',
                'body' => 'Ticket assigned for intake.',
                'data' => null,
                'read_at' => null,
                'created_at' => now()->subMinutes(3),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'type' => 'order.paid',
                'title' => 'Order paid',
                'body' => 'Payment completed successfully.',
                'data' => null,
                'read_at' => now()->subMinute(),
                'created_at' => now()->subMinutes(2),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'type' => 'ticket.comment.added',
                'title' => 'Consultant comment',
                'body' => 'Your consultant added a comment.',
                'data' => null,
                'read_at' => null,
                'created_at' => now()->subMinute(),
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => $otherUser->id,
                'type' => 'ticket.comment.added',
                'title' => 'Other user notification',
                'body' => 'Should not appear.',
                'data' => null,
                'read_at' => null,
                'created_at' => now(),
            ],
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/notifications?status=unread&per_page=10')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('total', 2);

        $this->getJson('/api/v1/notifications?type=ticket.comment.added&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'ticket.comment.added');

        $this->getJson('/api/v1/notifications?q=Payment&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'order.paid');

        $this->getJson('/api/v1/notifications?per_page=1&page=2')
            ->assertOk()
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('per_page', 1);
    }
}
