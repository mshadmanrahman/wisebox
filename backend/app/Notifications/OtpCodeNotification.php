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
        return (new MailMessage)
            ->subject('Your Wisebox verification code')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Use this verification code to continue:')
            ->line('**'.$this->code.'**')
            ->line("This code will expire in {$this->ttlMinutes} minutes.")
            ->line('If you did not request this code, you can safely ignore this message.');
    }
}
