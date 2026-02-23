<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MeetingScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $ticketNumber,
        public readonly string $propertyName,
        public readonly string $scheduledAt,
        public readonly string $meetLink,
        public readonly int $durationMinutes,
        public readonly string $consultantName,
        public readonly string $frontendUrl,
        public readonly int $ticketId,
        public readonly string $customerEmail = '',
        public readonly string $consultantEmail = '',
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
        $scheduledDate = \Carbon\Carbon::parse($this->scheduledAt);
        $formattedDate = $scheduledDate->format('l, M d, Y');
        $formattedTime = $scheduledDate->format('g:i A');

        return (new MailMessage)
            ->subject(__('notifications.meeting_scheduled.subject', ['property_name' => $this->propertyName], $locale))
            ->greeting(__('notifications.meeting_scheduled.greeting', ['name' => $notifiable->name], $locale))
            ->line(__('notifications.meeting_scheduled.scheduled', ['property_name' => $this->propertyName], $locale))
            ->line('**'.__('notifications.meeting_scheduled.date_label', ['date' => $formattedDate], $locale).'**')
            ->line('**'.__('notifications.meeting_scheduled.time_label', ['time' => $formattedTime], $locale).'**')
            ->line('**'.__('notifications.meeting_scheduled.duration_label', ['minutes' => $this->durationMinutes], $locale).'**')
            ->line('**'.__('notifications.meeting_scheduled.consultant_label', ['consultant_name' => $this->consultantName], $locale).'**')
            ->line('**'.__('notifications.meeting_scheduled.ticket_label', ['ticket_number' => $this->ticketNumber], $locale).'**')
            ->action(__('notifications.meeting_scheduled.join_meeting', [], $locale), $this->meetLink)
            ->line(__('notifications.meeting_scheduled.access_note', [], $locale))
            ->line(__('notifications.meeting_scheduled.punctuality', [], $locale))
            ->attachData(
                $this->generateIcs($notifiable),
                'consultation.ics',
                ['mime' => 'text/calendar; charset=UTF-8; method=REQUEST']
            );
    }

    private function generateIcs(object $notifiable): string
    {
        $locale = $notifiable->profile?->preferred_language ?? 'en';
        $start = \Carbon\Carbon::parse($this->scheduledAt)->utc();
        $end = $start->copy()->addMinutes($this->durationMinutes);

        $uid = "wisebox-{$this->ticketId}-{$start->timestamp}@wisebox.app";
        $dtStart = $start->format('Ymd\THis\Z');
        $dtEnd = $end->format('Ymd\THis\Z');
        $dtstamp = now()->utc()->format('Ymd\THis\Z');

        $customerName = $notifiable->name ?? 'Customer';
        $description = "Free consultation for {$this->propertyName} with {$this->consultantName}";

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Wisebox//Consultation//EN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            "UID:{$uid}",
            "DTSTAMP:{$dtstamp}",
            "DTSTART:{$dtStart}",
            "DTEND:{$dtEnd}",
            "SUMMARY:Wisebox Consultation: {$this->ticketNumber}",
            "DESCRIPTION:{$description}",
            "LOCATION:{$this->meetLink}",
        ];

        if ($this->consultantEmail !== '') {
            $lines[] = "ORGANIZER;CN={$this->consultantName}:mailto:{$this->consultantEmail}";
        }

        if ($this->customerEmail !== '') {
            $lines[] = "ATTENDEE;CN={$customerName};RSVP=TRUE:mailto:{$this->customerEmail}";
        }

        $lines = array_merge($lines, [
            'BEGIN:VALARM',
            'TRIGGER:-PT30M',
            'ACTION:DISPLAY',
            'DESCRIPTION:'.__('notifications.meeting_scheduled.alarm_30', [], $locale),
            'END:VALARM',
            'BEGIN:VALARM',
            'TRIGGER:-PT15M',
            'ACTION:DISPLAY',
            'DESCRIPTION:'.__('notifications.meeting_scheduled.alarm_15', [], $locale),
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR',
        ]);

        return implode("\r\n", $lines) . "\r\n";
    }
}
