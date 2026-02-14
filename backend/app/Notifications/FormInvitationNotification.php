<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FormInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $templateName,
        public readonly string $ticketNumber,
        public readonly string $propertyName,
        public readonly string $consultantName,
        public readonly string $formUrl,
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
        return (new MailMessage)
            ->subject("Please complete: {$this->templateName} for {$this->ticketNumber}")
            ->greeting("Hello,")
            ->line("Your consultant **{$this->consultantName}** has requested you to fill out a form for your property consultation.")
            ->line("**Form:** {$this->templateName}")
            ->line("**Ticket:** {$this->ticketNumber}")
            ->line("**Property:** {$this->propertyName}")
            ->line('Please complete this form at your earliest convenience to help us assist you better.')
            ->action('Fill Out Form', $this->formUrl)
            ->line('This link will expire in 7 days. No login is required to complete the form.');
    }
}
