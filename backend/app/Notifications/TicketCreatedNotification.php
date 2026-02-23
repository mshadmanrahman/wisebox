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
        $locale = $notifiable->profile?->preferred_language ?? 'en';

        $message = (new MailMessage)
            ->subject(__('notifications.ticket_created.subject', ['property_name' => $this->propertyName], $locale))
            ->greeting(__('notifications.ticket_created.greeting', ['name' => $notifiable->name], $locale))
            ->line(__('notifications.ticket_created.submitted', ['property_name' => $this->propertyName], $locale))
            ->line('**'.__('notifications.ticket_created.ticket_label', ['ticket_number' => $this->ticketNumber], $locale).'**');

        if ($this->serviceName) {
            $message->line('**'.__('notifications.ticket_created.service_label', ['service_name' => $this->serviceName], $locale).'**');
        }

        return $message
            ->line('**'.__('notifications.ticket_created.next_steps', [], $locale).'**')
            ->action(__('notifications.ticket_created.view_ticket', [], $locale), "{$this->frontendUrl}/tickets/{$this->ticketId}")
            ->line(__('notifications.ticket_created.thank_you', [], $locale));
    }
}
