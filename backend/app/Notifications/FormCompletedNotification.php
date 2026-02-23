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
        $locale = $notifiable->profile?->preferred_language ?? 'en';

        return (new MailMessage)
            ->subject(__('notifications.form_completed.subject', ['template_name' => $this->templateName, 'ticket_number' => $this->ticketNumber], $locale))
            ->greeting(__('notifications.form_completed.greeting', ['name' => $notifiable->name], $locale))
            ->line(__('notifications.form_completed.completed', ['customer_email' => $this->customerEmail], $locale))
            ->line('**'.__('notifications.form_completed.form_label', ['template_name' => $this->templateName], $locale).'**')
            ->line('**'.__('notifications.form_completed.ticket_label', ['ticket_number' => $this->ticketNumber], $locale).'**')
            ->action(__('notifications.form_completed.view_responses', [], $locale), $this->ticketUrl)
            ->line(__('notifications.form_completed.review_note', [], $locale));
    }
}
