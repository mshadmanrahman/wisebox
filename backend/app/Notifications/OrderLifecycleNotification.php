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
        $locale = $notifiable->profile?->preferred_language ?? 'en';
        [$subject, $lineOne] = $this->mailCopy($locale);

        return (new MailMessage)
            ->subject($subject)
            ->greeting(__('notifications.otp.greeting', ['name' => $notifiable->name], $locale))
            ->line($lineOne)
            ->line(__('notifications.order_lifecycle.order_label', ['order_number' => $this->orderNumber], $locale))
            ->line(__('notifications.order_lifecycle.total_label', ['total' => number_format($this->total, 2), 'currency' => $this->currency], $locale))
            ->action(
                __('notifications.order_lifecycle.view_order', [], $locale),
                rtrim($this->frontendUrl, '/')."/orders/{$this->orderId}"
            );
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function mailCopy(string $locale): array
    {
        $key = in_array($this->event, ['created', 'paid', 'failed', 'cancelled', 'refunded'], true)
            ? $this->event
            : 'default';

        return [
            __("notifications.order_lifecycle.{$key}.subject", [], $locale),
            __("notifications.order_lifecycle.{$key}.body", [], $locale),
        ];
    }
}
