<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderLifecycleNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $event,
        public readonly int $orderId,
        public readonly string $orderNumber,
        public readonly float $total,
        public readonly string $currency,
        public readonly string $frontendUrl,
    ) {
        $this->onQueue('notifications');
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        [$subject, $lineOne] = $this->mailCopy();

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->name.',')
            ->line($lineOne)
            ->line("Order: {$this->orderNumber}")
            ->line('Total: '.number_format($this->total, 2)." {$this->currency}")
            ->action('View Order', rtrim($this->frontendUrl, '/')."/orders/{$this->orderId}");
    }

    private function mailCopy(): array
    {
        return match ($this->event) {
            'created' => ['Order received', 'We received your order and it is pending payment.'],
            'paid' => ['Payment confirmed', 'Your payment has been confirmed and processing has started.'],
            'failed' => ['Payment failed', 'Your payment attempt failed. Please try checkout again.'],
            'cancelled' => ['Order cancelled', 'Your order has been cancelled.'],
            'refunded' => ['Order refunded', 'Your payment has been refunded and the order is closed.'],
            default => ['Order update', 'There is an update on your order.'],
        };
    }
}
