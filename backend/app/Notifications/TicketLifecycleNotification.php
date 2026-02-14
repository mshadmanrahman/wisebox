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
        [$subject, $lineOne] = $this->mailCopy();

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->name.',')
            ->line($lineOne)
            ->line("Ticket: {$this->ticketNumber}");

        if ($this->commentBody) {
            $message->line('---');
            $message->line($this->commentBody);
            $message->line('---');
        }

        if ($this->status !== null) {
            $message->line("Current status: {$this->status}");
        }

        return $message->action('View Ticket', rtrim($this->frontendUrl, '/')."/tickets/{$this->ticketId}");
    }

    private function mailCopy(): array
    {
        return match ($this->event) {
            'assigned' => ['Ticket assigned', 'A consultant has been assigned to this ticket.'],
            'status_updated' => [
                'Ticket status updated',
                "Status changed from {$this->fromStatus} to {$this->status}.",
            ],
            'comment_added' => [
                'New ticket comment',
                ($this->actor ?? 'A consultant').' posted a new comment on this ticket.',
            ],
            default => ['Ticket update', 'There is an update on your ticket.'],
        };
    }
}
