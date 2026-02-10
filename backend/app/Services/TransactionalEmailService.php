<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\OrderLifecycleNotification;
use App\Notifications\TicketLifecycleNotification;
use Illuminate\Support\Facades\Log;
use Throwable;

class TransactionalEmailService
{
    public function sendOrderCreated(User $user, Order $order): void
    {
        $this->notifyOrder($user, $order, 'created');
    }

    public function sendOrderPaid(User $user, Order $order): void
    {
        $this->notifyOrder($user, $order, 'paid');
    }

    public function sendOrderPaymentFailed(User $user, Order $order): void
    {
        $this->notifyOrder($user, $order, 'failed');
    }

    public function sendOrderCancelled(User $user, Order $order): void
    {
        $this->notifyOrder($user, $order, 'cancelled');
    }

    public function sendOrderRefunded(User $user, Order $order): void
    {
        $this->notifyOrder($user, $order, 'refunded');
    }

    public function sendTicketAssigned(User $user, Ticket $ticket): void
    {
        $this->notifyTicket($user, $ticket, 'assigned');
    }

    public function sendTicketStatusUpdated(User $user, Ticket $ticket, ?string $fromStatus = null): void
    {
        $this->notifyTicket($user, $ticket, 'status_updated', $fromStatus);
    }

    public function sendTicketCommentAdded(User $user, Ticket $ticket, string $actor): void
    {
        $this->notifyTicket($user, $ticket, 'comment_added', null, $actor);
    }

    private function notifyOrder(User $user, Order $order, string $event): void
    {
        try {
            $user->notify(new OrderLifecycleNotification(
                event: $event,
                orderId: (int) $order->id,
                orderNumber: (string) $order->order_number,
                total: (float) $order->total,
                currency: (string) $order->currency,
                frontendUrl: (string) config('services.frontend.url', 'http://localhost:3000'),
            ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue order lifecycle email notification.', [
                'event' => $event,
                'order_id' => $order->id,
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function notifyTicket(
        User $user,
        Ticket $ticket,
        string $event,
        ?string $fromStatus = null,
        ?string $actor = null
    ): void {
        try {
            $user->notify(new TicketLifecycleNotification(
                event: $event,
                ticketId: (int) $ticket->id,
                ticketNumber: (string) $ticket->ticket_number,
                status: $ticket->status ? (string) $ticket->status : null,
                frontendUrl: (string) config('services.frontend.url', 'http://localhost:3000'),
                fromStatus: $fromStatus,
                actor: $actor,
            ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue ticket lifecycle email notification.', [
                'event' => $event,
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
