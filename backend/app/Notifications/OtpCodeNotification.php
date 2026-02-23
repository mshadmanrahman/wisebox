<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpCodeNotification extends Notification
{
    public function __construct(
        public readonly string $code,
        public readonly int $ttlMinutes = 10,
    ) {}

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

        return (new MailMessage)
            ->subject(__('notifications.otp.subject', [], $locale))
            ->greeting(__('notifications.otp.greeting', ['name' => $notifiable->name], $locale))
            ->line(__('notifications.otp.line1', [], $locale))
            ->line('**'.$this->code.'**')
            ->line(__('notifications.otp.expires', ['minutes' => $this->ttlMinutes], $locale))
            ->line(__('notifications.otp.ignore', [], $locale));
    }
}
