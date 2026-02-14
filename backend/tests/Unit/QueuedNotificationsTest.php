<?php

namespace Tests\Unit;

use App\Notifications\MeetingScheduledNotification;
use App\Notifications\OrderLifecycleNotification;
use App\Notifications\TicketCreatedNotification;
use App\Notifications\TicketLifecycleNotification;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Tests\TestCase;

class QueuedNotificationsTest extends TestCase
{
    public function test_order_lifecycle_notification_implements_should_queue(): void
    {
        $notification = new OrderLifecycleNotification(
            event: 'created',
            orderId: 1,
            orderNumber: 'WB-2026-00001',
            total: 25.00,
            currency: 'USD',
            frontendUrl: 'http://localhost:3000',
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }

    public function test_ticket_lifecycle_notification_implements_should_queue(): void
    {
        $notification = new TicketLifecycleNotification(
            event: 'assigned',
            ticketId: 1,
            ticketNumber: 'TK-2026-00001',
            status: 'assigned',
            frontendUrl: 'http://localhost:3000',
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }

    public function test_ticket_created_notification_implements_should_queue(): void
    {
        $notification = new TicketCreatedNotification(
            ticketNumber: 'TK-2026-00001',
            propertyName: 'Test Property',
            serviceName: 'Legal Review',
            frontendUrl: 'http://localhost:3000',
            ticketId: 1,
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }

    public function test_ticket_created_notification_mail_content(): void
    {
        $notification = new TicketCreatedNotification(
            ticketNumber: 'TK-2026-00042',
            propertyName: 'Gulshan Villa',
            serviceName: 'Ownership Verification',
            frontendUrl: 'https://app.wisebox.test',
            ticketId: 42,
        );

        $notifiable = new class {
            public string $name = 'Shadman';
        };

        $mail = $notification->toMail($notifiable);

        $this->assertInstanceOf(MailMessage::class, $mail);
        $this->assertSame('Consultation Request Submitted: Gulshan Villa', $mail->subject);
        $this->assertSame('Hello Shadman,', $mail->greeting);
        $this->assertSame('https://app.wisebox.test/tickets/42', $mail->actionUrl);

        $body = implode(' ', $mail->introLines);
        $this->assertStringContainsString('Gulshan Villa', $body);
        $this->assertStringContainsString('TK-2026-00042', $body);
        $this->assertStringContainsString('Ownership Verification', $body);
        $this->assertStringContainsString('What happens next?', $body);
    }

    public function test_ticket_created_notification_omits_service_when_null(): void
    {
        $notification = new TicketCreatedNotification(
            ticketNumber: 'TK-2026-00043',
            propertyName: 'Dhanmondi Flat',
            serviceName: null,
            frontendUrl: 'http://localhost:3000',
            ticketId: 43,
        );

        $notifiable = new class {
            public string $name = 'Customer';
        };

        $mail = $notification->toMail($notifiable);
        $body = implode(' ', $mail->introLines);

        $this->assertStringNotContainsString('**Service:**', $body);
    }

    public function test_meeting_scheduled_notification_implements_should_queue(): void
    {
        $notification = new MeetingScheduledNotification(
            ticketNumber: 'TK-2026-00001',
            propertyName: 'Test Property',
            scheduledAt: '2026-03-15T10:00:00Z',
            meetLink: 'https://meet.google.com/abc-defg-hij',
            durationMinutes: 30,
            consultantName: 'Dr. Rahman',
            frontendUrl: 'http://localhost:3000',
            ticketId: 1,
        );

        $this->assertInstanceOf(ShouldQueue::class, $notification);
    }

    public function test_meeting_scheduled_notification_includes_ics_attachment(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-02-14T12:00:00Z'));

        $notification = new MeetingScheduledNotification(
            ticketNumber: 'TK-2026-00050',
            propertyName: 'Uttara Plot',
            scheduledAt: '2026-03-20T09:00:00Z',
            meetLink: 'https://meet.google.com/xyz-abcd-efg',
            durationMinutes: 45,
            consultantName: 'Karim Ahmed',
            frontendUrl: 'http://localhost:3000',
            ticketId: 50,
            customerEmail: 'customer@example.com',
            consultantEmail: 'karim@wisebox.app',
        );

        $notifiable = new class {
            public string $name = 'Rahim';
        };

        $mail = $notification->toMail($notifiable);

        $this->assertNotEmpty($mail->rawAttachments);
        $attachment = $mail->rawAttachments[0];

        $this->assertSame('consultation.ics', $attachment['name']);
        $this->assertSame('text/calendar; charset=UTF-8; method=REQUEST', $attachment['options']['mime']);

        $ics = $attachment['data'];

        $this->assertStringContainsString('BEGIN:VCALENDAR', $ics);
        $this->assertStringContainsString('METHOD:REQUEST', $ics);
        $this->assertStringContainsString('DTSTART:20260320T090000Z', $ics);
        $this->assertStringContainsString('DTEND:20260320T094500Z', $ics);
        $this->assertStringContainsString('SUMMARY:Wisebox Consultation: TK-2026-00050', $ics);
        $this->assertStringContainsString('LOCATION:https://meet.google.com/xyz-abcd-efg', $ics);
        $this->assertStringContainsString('ORGANIZER;CN=Karim Ahmed:mailto:karim@wisebox.app', $ics);
        $this->assertStringContainsString('ATTENDEE;CN=Rahim;RSVP=TRUE:mailto:customer@example.com', $ics);
        $this->assertStringContainsString('TRIGGER:-PT30M', $ics);
        $this->assertStringContainsString('TRIGGER:-PT15M', $ics);
        $this->assertStringContainsString('END:VCALENDAR', $ics);

        // Verify CRLF line endings (RFC 5545 requirement)
        $this->assertStringContainsString("\r\n", $ics);

        Carbon::setTestNow();
    }

    public function test_meeting_scheduled_notification_ics_omits_emails_when_empty(): void
    {
        $notification = new MeetingScheduledNotification(
            ticketNumber: 'TK-2026-00051',
            propertyName: 'Test Property',
            scheduledAt: '2026-04-01T14:00:00Z',
            meetLink: 'https://meet.google.com/aaa-bbbb-ccc',
            durationMinutes: 30,
            consultantName: 'Consultant',
            frontendUrl: 'http://localhost:3000',
            ticketId: 51,
        );

        $notifiable = new class {
            public string $name = 'Customer';
        };

        $mail = $notification->toMail($notifiable);
        $ics = $mail->rawAttachments[0]['data'];

        $this->assertStringNotContainsString('ORGANIZER', $ics);
        $this->assertStringNotContainsString('ATTENDEE', $ics);
    }
}
