<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * All transactional emails sent via Resend HTTP API (bypasses SMTP).
 * SMTP is unreliable on Railway due to firewall restrictions on ports 465/587.
 */
class TransactionalEmailService
{
    // ── Order emails ──────────────────────────────────────────────

    public function sendOrderCreated(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'created', 'Order Confirmed');
    }

    public function sendOrderPaid(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'paid', 'Payment Received');
    }

    public function sendOrderPaymentFailed(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'failed', 'Payment Failed');
    }

    public function sendOrderCancelled(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'cancelled', 'Order Cancelled');
    }

    public function sendOrderRefunded(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'refunded', 'Order Refunded');
    }

    // ── Ticket emails ─────────────────────────────────────────────

    public function sendTicketAssigned(User $user, Ticket $ticket): void
    {
        $this->sendTicketEmail($user, $ticket, 'A consultant has been assigned to your ticket.');
    }

    public function sendTicketStatusUpdated(User $user, Ticket $ticket, ?string $fromStatus = null): void
    {
        $extra = $fromStatus ? " (was: {$fromStatus})" : '';
        $this->sendTicketEmail($user, $ticket, "Your ticket status has been updated to <strong>{$ticket->status}</strong>{$extra}.");
    }

    public function sendTicketCommentAdded(User $user, Ticket $ticket, string $actor, ?string $commentBody = null): void
    {
        $body = $commentBody ? "<blockquote>{$commentBody}</blockquote>" : '';
        $this->sendTicketEmail($user, $ticket, "{$actor} added a comment to your ticket.{$body}");
    }

    public function sendTicketCreated(User $customer, Ticket $ticket): void
    {
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? 'Your Property');
        $serviceName = $ticket->service?->name ? (string) $ticket->service->name : 'Property Consultation';
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/dashboard/tickets/{$ticket->id}";

        $html = "<h2>Your Ticket Has Been Created</h2>"
            . "<p>Hello {$customer->name},</p>"
            . "<p>Your consultation request has been submitted successfully.</p>"
            . "<p><strong>Ticket:</strong> {$ticketNumber}<br>"
            . "<strong>Property:</strong> {$propertyName}<br>"
            . "<strong>Service:</strong> {$serviceName}</p>"
            . "<p>A consultant will be assigned shortly. You'll receive an email when there's an update.</p>"
            . $this->ctaButton('View Ticket', $ticketUrl);

        $this->sendViaResend($customer->email, "Ticket {$ticketNumber} created for {$propertyName}", $html, 'ticket_created', ['ticket_id' => $ticket->id]);
    }

    // ── Meeting email ─────────────────────────────────────────────

    public function sendMeetingScheduled(
        User $customer,
        Ticket $ticket,
        string $meetLink,
        \Carbon\Carbon $scheduledAt,
        int $durationMinutes,
    ): void {
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? 'Your Property');
        $consultantName = (string) ($ticket->consultant?->name ?? 'Wisebox Consultant');
        $formattedDate = $scheduledAt->format('l, F j, Y \a\t g:i A');

        $meetSection = $meetLink
            ? $this->ctaButton('Join Meeting', $meetLink)
            : "<p><strong>Meeting link:</strong> Your consultant will share the meeting link separately.</p>";

        $html = "<h2>Consultation Meeting Scheduled</h2>"
            . "<p>Hello {$customer->name},</p>"
            . "<p>Your consultation meeting has been scheduled.</p>"
            . "<p><strong>Ticket:</strong> {$ticketNumber}<br>"
            . "<strong>Property:</strong> {$propertyName}<br>"
            . "<strong>Consultant:</strong> {$consultantName}<br>"
            . "<strong>Date:</strong> {$formattedDate}<br>"
            . "<strong>Duration:</strong> {$durationMinutes} minutes</p>"
            . $meetSection
            . "<p style=\"color:#666;font-size:13px;\">Please join a few minutes early. If you need to reschedule, contact your consultant.</p>";

        $this->sendViaResend($customer->email, "Meeting scheduled for {$ticketNumber}", $html, 'meeting_scheduled', ['ticket_id' => $ticket->id]);
    }

    // ── Form emails ───────────────────────────────────────────────

    public function sendFormInvitation(
        string $customerEmail,
        Ticket $ticket,
        string $templateName,
        string $formUrl,
    ): void {
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? 'Your Property');
        $consultantName = (string) ($ticket->consultant?->name ?? 'Wisebox Consultant');

        $html = "<h2>Consultation Form Request</h2>"
            . "<p>Hello,</p>"
            . "<p>Your consultant <strong>{$consultantName}</strong> has requested you to fill out a form for your property consultation.</p>"
            . "<p><strong>Form:</strong> {$templateName}<br>"
            . "<strong>Ticket:</strong> {$ticketNumber}<br>"
            . "<strong>Property:</strong> {$propertyName}</p>"
            . "<p>Please complete this form at your earliest convenience to help us assist you better.</p>"
            . $this->ctaButton('Fill Out Form', $formUrl)
            . "<p style=\"color:#666;font-size:13px;\">This link will expire in 7 days. No login is required to complete the form.</p>";

        $this->sendViaResend($customerEmail, "Please complete: {$templateName} for {$ticketNumber}", $html, 'form_invitation', ['ticket_id' => $ticket->id]);
    }

    public function sendFormCompleted(
        User $consultant,
        Ticket $ticket,
        string $templateName,
    ): void {
        $ticketNumber = (string) $ticket->ticket_number;
        $customerEmail = (string) ($ticket->customer?->email ?? 'customer');
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/consultant/tickets/{$ticket->id}";

        $html = "<h2>Form Completed by Customer</h2>"
            . "<p>Hello {$consultant->name},</p>"
            . "<p>The customer ({$customerEmail}) has completed the <strong>{$templateName}</strong> form for ticket {$ticketNumber}.</p>"
            . "<p>Review the responses and proceed with the consultation.</p>"
            . $this->ctaButton('View Ticket', $ticketUrl);

        $this->sendViaResend($consultant->email, "Form completed: {$templateName} for {$ticketNumber}", $html, 'form_completed', ['ticket_id' => $ticket->id]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function sendTicketEmail(User $user, Ticket $ticket, string $message): void
    {
        $ticketNumber = (string) $ticket->ticket_number;
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/dashboard/tickets/{$ticket->id}";

        $html = "<h2>Ticket Update: {$ticketNumber}</h2>"
            . "<p>Hello {$user->name},</p>"
            . "<p>{$message}</p>"
            . $this->ctaButton('View Ticket', $ticketUrl);

        $this->sendViaResend($user->email, "Update for ticket {$ticketNumber}", $html, 'ticket_update', ['ticket_id' => $ticket->id]);
    }

    private function sendOrderEmail(User $user, Order $order, string $event, string $label): void
    {
        $orderNumber = (string) $order->order_number;
        $total = number_format((float) $order->total, 2);
        $currency = strtoupper((string) $order->currency);
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $orderUrl = "{$frontendUrl}/dashboard/orders/{$order->id}";

        $html = "<h2>{$label}</h2>"
            . "<p>Hello {$user->name},</p>"
            . "<p>Your order <strong>{$orderNumber}</strong> ({$currency} {$total}) has been {$event}.</p>"
            . $this->ctaButton('View Order', $orderUrl);

        $this->sendViaResend($user->email, "{$label}: {$orderNumber}", $html, "order_{$event}", ['order_id' => $order->id]);
    }

    private function ctaButton(string $label, string $url): string
    {
        return "<p><a href=\"{$url}\" style=\"background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;\">{$label}</a></p>";
    }

    /**
     * Send email via Resend HTTP API. Bypasses SMTP entirely.
     * https://resend.com/docs/api-reference/emails/send-email
     */
    private function sendViaResend(string $to, string $subject, string $html, string $tag, array $context = []): void
    {
        $apiKey = config('services.resend.key') ?: env('MAIL_PASSWORD');
        $fromAddress = config('mail.from.address', 'onboarding@resend.dev');
        $fromName = config('mail.from.name', 'Wisebox');

        try {
            $response = Http::withToken($apiKey)
                ->timeout(10)
                ->post('https://api.resend.com/emails', [
                    'from' => "{$fromName} <{$fromAddress}>",
                    'to' => [$to],
                    'subject' => $subject,
                    'html' => $html,
                    'tags' => [['name' => 'type', 'value' => $tag]],
                ]);

            if ($response->successful()) {
                Log::info("Email sent via Resend [{$tag}]", array_merge($context, [
                    'to' => $to,
                    'resend_id' => $response->json('id'),
                ]));
            } else {
                Log::warning("Resend API rejected email [{$tag}]", array_merge($context, [
                    'to' => $to,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]));
            }
        } catch (Throwable $exception) {
            Log::warning("Failed to send email via Resend [{$tag}]", array_merge($context, [
                'to' => $to,
                'error' => $exception->getMessage(),
            ]));
        }
    }
}
