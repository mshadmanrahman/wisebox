<?php

namespace Tests\Unit;

use App\Notifications\OrderLifecycleNotification;
use App\Notifications\TicketLifecycleNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Tests\TestCase;

class QueuedNotificationsTest extends TestCase
{
    public function test_order_lifecycle_notification_implements_should_queue(): void
    {
        $notification = new OrderLifecycleNotification(
            event: 'created',
            orderId: 1,
            orderNumber: 'WB-2026-00001',
            total: 25.00,
            currency: 'USD',
            frontendUrl: 'http://localhost:3000',
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }

    public function test_ticket_lifecycle_notification_implements_should_queue(): void
    {
        $notification = new TicketLifecycleNotification(
            event: 'assigned',
            ticketId: 1,
            ticketNumber: 'TK-2026-00001',
            status: 'assigned',
            frontendUrl: 'http://localhost:3000',
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }
}
