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
        $locale = $notifiable->profile?->preferred_language ?? 'en';

        return (new MailMessage)
            ->subject(__('notifications.form_invitation.subject', ['template_name' => $this->templateName, 'ticket_number' => $this->ticketNumber], $locale))
            ->greeting(__('notifications.form_invitation.greeting', [], $locale))
            ->line(__('notifications.form_invitation.request', ['consultant_name' => $this->consultantName], $locale))
            ->line('**'.__('notifications.form_invitation.form_label', ['template_name' => $this->templateName], $locale).'**')
            ->line('**'.__('notifications.form_invitation.ticket_label', ['ticket_number' => $this->ticketNumber], $locale).'**')
            ->line('**'.__('notifications.form_invitation.property_label', ['property_name' => $this->propertyName], $locale).'**')
            ->line(__('notifications.form_invitation.please_complete', [], $locale))
            ->action(__('notifications.form_invitation.fill_form', [], $locale), $this->formUrl)
            ->line(__('notifications.form_invitation.expiry_note', [], $locale));
    }
}
