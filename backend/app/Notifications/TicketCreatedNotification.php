<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $ticketNumber,
        public readonly string $propertyName,
        public readonly ?string $serviceName,
        public readonly string $frontendUrl,
        public readonly int $ticketId,
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
        $message = (new MailMessage)
            ->subject("Consultation Request Submitted: {$this->propertyName}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your request for a free consultation for **{$this->propertyName}** has been submitted.")
            ->line("**Ticket:** {$this->ticketNumber}");

        if ($this->serviceName) {
            $message->line("**Service:** {$this->serviceName}");
        }

        return $message
            ->line('**What happens next?** Our team will review your request and assign a qualified consultant. You will receive an email once a consultant has been assigned.')
            ->action('View Ticket', "{$this->frontendUrl}/tickets/{$this->ticketId}")
            ->line('Thank you for choosing Wisebox.');
    }
}
