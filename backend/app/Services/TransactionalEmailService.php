<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\FormCompletedNotification;
use App\Notifications\FormInvitationNotification;
use App\Notifications\MeetingScheduledNotification;
use App\Notifications\OrderLifecycleNotification;
use App\Notifications\TicketCreatedNotification;
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

    public function sendTicketCommentAdded(User $user, Ticket $ticket, string $actor, ?string $commentBody = null): void
    {
        $this->notifyTicket($user, $ticket, 'comment_added', null, $actor, $commentBody);
    }

    public function sendTicketCreated(User $customer, Ticket $ticket): void
    {
        try {
            $customer->notify(new TicketCreatedNotification(
                ticketNumber: (string) $ticket->ticket_number,
                propertyName: (string) ($ticket->property?->property_name ?? 'Your Property'),
                serviceName: $ticket->service?->name ? (string) $ticket->service->name : null,
                frontendUrl: (string) config('services.frontend.url', 'http://localhost:3000'),
                ticketId: (int) $ticket->id,
            ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue ticket created email.', [
                'ticket_id' => $ticket->id,
                'customer_id' => $customer->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function sendMeetingScheduled(
        User $customer,
        Ticket $ticket,
        string $meetLink,
        \Carbon\Carbon $scheduledAt,
        int $durationMinutes,
    ): void {
        try {
            $customer->notify(new MeetingScheduledNotification(
                ticketNumber: (string) $ticket->ticket_number,
                propertyName: (string) ($ticket->property?->property_name ?? 'Your Property'),
                scheduledAt: $scheduledAt->toISOString(),
                meetLink: $meetLink,
                durationMinutes: $durationMinutes,
                consultantName: (string) ($ticket->consultant?->name ?? 'Wisebox Consultant'),
                frontendUrl: (string) config('services.frontend.url', 'http://localhost:3000'),
                ticketId: (int) $ticket->id,
                customerEmail: (string) $customer->email,
                consultantEmail: (string) ($ticket->consultant?->email ?? ''),
            ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue meeting scheduled email notification.', [
                'ticket_id' => $ticket->id,
                'customer_id' => $customer->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function sendFormInvitation(
        string $customerEmail,
        Ticket $ticket,
        string $templateName,
        string $formUrl,
    ): void {
        try {
            \Illuminate\Support\Facades\Notification::route('mail', $customerEmail)
                ->notify(new FormInvitationNotification(
                    templateName: $templateName,
                    ticketNumber: (string) $ticket->ticket_number,
                    propertyName: (string) ($ticket->property?->property_name ?? 'Your Property'),
                    consultantName: (string) ($ticket->consultant?->name ?? 'Wisebox Consultant'),
                    formUrl: $formUrl,
                ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue form invitation email notification.', [
                'ticket_id' => $ticket->id,
                'customer_email' => $customerEmail,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    public function sendFormCompleted(
        User $consultant,
        Ticket $ticket,
        string $templateName,
    ): void {
        try {
            $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
            $consultant->notify(new FormCompletedNotification(
                templateName: $templateName,
                ticketNumber: (string) $ticket->ticket_number,
                customerEmail: (string) ($ticket->customer?->email ?? 'customer'),
                ticketUrl: "{$frontendUrl}/consultant/tickets/{$ticket->id}",
            ));
        } catch (Throwable $exception) {
            Log::warning('Failed to queue form completed email notification.', [
                'ticket_id' => $ticket->id,
                'consultant_id' => $consultant->id,
                'error' => $exception->getMessage(),
            ]);
        }
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
        ?string $actor = null,
        ?string $commentBody = null,
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
                commentBody: $commentBody,
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
