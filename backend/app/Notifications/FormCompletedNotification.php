<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FormCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $templateName,
        public readonly string $ticketNumber,
        public readonly string $customerEmail,
        public readonly string $ticketUrl,
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
            ->subject("Form completed: {$this->templateName} for {$this->ticketNumber}")
            ->greeting("Hello {$notifiable->name},")
            ->line("The customer (**{$this->customerEmail}**) has completed the consultation form you sent.")
            ->line("**Form:** {$this->templateName}")
            ->line("**Ticket:** {$this->ticketNumber}")
            ->action('View Responses', $this->ticketUrl)
            ->line('You can review the responses from the ticket detail page.');
    }
}
