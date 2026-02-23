<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketLifecycleNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $event,
        public readonly int $ticketId,
        public readonly string $ticketNumber,
        public readonly ?string $status,
        public readonly string $frontendUrl,
        public readonly ?string $fromStatus = null,
        public readonly ?string $actor = null,
        public readonly ?string $commentBody = null,
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

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting(__('notifications.otp.greeting', ['name' => $notifiable->name], $locale))
            ->line($lineOne)
            ->line(__('notifications.ticket_lifecycle.ticket_label', ['ticket_number' => $this->ticketNumber], $locale));

        if ($this->commentBody) {
            $message->line('---');
            $message->line($this->commentBody);
            $message->line('---');
        }

        if ($this->status !== null) {
            $message->line(__('notifications.ticket_lifecycle.current_status', ['status' => $this->status], $locale));
        }

        return $message->action(
            __('notifications.ticket_lifecycle.view_ticket', [], $locale),
            rtrim($this->frontendUrl, '/')."/tickets/{$this->ticketId}"
        );
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function mailCopy(string $locale): array
    {
        return match ($this->event) {
            'assigned' => [
                __('notifications.ticket_lifecycle.assigned.subject', [], $locale),
                __('notifications.ticket_lifecycle.assigned.body', [], $locale),
            ],
            'status_updated' => [
                __('notifications.ticket_lifecycle.status_updated.subject', [], $locale),
                __('notifications.ticket_lifecycle.status_updated.body', ['from_status' => $this->fromStatus, 'to_status' => $this->status], $locale),
            ],
            'comment_added' => [
                __('notifications.ticket_lifecycle.comment_added.subject', [], $locale),
                $this->actor
                    ? __('notifications.ticket_lifecycle.comment_added.body', ['actor' => $this->actor], $locale)
                    : __('notifications.ticket_lifecycle.comment_added.body_default', [], $locale),
            ],
            default => [
                __('notifications.ticket_lifecycle.default.subject', [], $locale),
                __('notifications.ticket_lifecycle.default.body', [], $locale),
            ],
        };
    }
}
