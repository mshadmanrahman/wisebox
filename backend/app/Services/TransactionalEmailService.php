<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\App;
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
        $this->sendOrderEmail($user, $order, 'created', __('notifications.order_lifecycle.created.subject', [], $this->userLocale($user)));
    }

    public function sendOrderPaid(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'paid', __('notifications.order_lifecycle.paid.subject', [], $this->userLocale($user)));
    }

    public function sendOrderPaymentFailed(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'failed', __('notifications.order_lifecycle.failed.subject', [], $this->userLocale($user)));
    }

    public function sendOrderCancelled(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'cancelled', __('notifications.order_lifecycle.cancelled.subject', [], $this->userLocale($user)));
    }

    public function sendOrderRefunded(User $user, Order $order): void
    {
        $this->sendOrderEmail($user, $order, 'refunded', __('notifications.order_lifecycle.refunded.subject', [], $this->userLocale($user)));
    }

    // ── Ticket emails ─────────────────────────────────────────────

    public function sendTicketAssigned(User $user, Ticket $ticket): void
    {
        $locale = $this->userLocale($user);
        $this->sendTicketEmail($user, $ticket, __('notifications.email.ticket_assigned_message', [], $locale));
    }

    public function sendTicketStatusUpdated(User $user, Ticket $ticket, ?string $fromStatus = null): void
    {
        $locale = $this->userLocale($user);
        $message = $fromStatus
            ? __('notifications.email.ticket_status_updated_was', ['status' => $ticket->status, 'from_status' => $fromStatus], $locale)
            : __('notifications.email.ticket_status_updated', ['status' => $ticket->status], $locale);
        $this->sendTicketEmail($user, $ticket, $message);
    }

    public function sendTicketCommentAdded(User $user, Ticket $ticket, string $actor, ?string $commentBody = null): void
    {
        $locale = $this->userLocale($user);
        $body = $commentBody ? "<blockquote>{$commentBody}</blockquote>" : '';
        $this->sendTicketEmail($user, $ticket, __('notifications.email.ticket_comment_added', ['actor' => $actor], $locale).$body);
    }

    public function sendTicketCreated(User $customer, Ticket $ticket): void
    {
        $locale = $this->userLocale($customer);
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $serviceName = $ticket->service?->name ? (string) $ticket->service->name : __('notifications.email.default_service', [], $locale);
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/tickets/{$ticket->id}";

        $html = "<h2>".__('notifications.email.ticket_created_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $customer->name], $locale)."</p>"
            . "<p>".__('notifications.email.ticket_created_body', [], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_ticket', [], $locale)."</strong> {$ticketNumber}<br>"
            . "<strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}<br>"
            . "<strong>".__('notifications.email.label_service', [], $locale)."</strong> {$serviceName}</p>"
            . "<p>".__('notifications.email.ticket_created_consultant_note', [], $locale)."</p>"
            . $this->ctaButton(__('notifications.email.view_ticket', [], $locale), $ticketUrl);

        $this->sendViaResend(
            $customer->email,
            __('notifications.email.ticket_created_subject', ['ticket_number' => $ticketNumber, 'property_name' => $propertyName], $locale),
            $html,
            'ticket_created',
            ['ticket_id' => $ticket->id]
        );
    }

    // ── Meeting email ─────────────────────────────────────────────

    public function sendMeetingScheduled(
        User $customer,
        Ticket $ticket,
        string $meetLink,
        \Carbon\Carbon $scheduledAt,
        int $durationMinutes,
    ): void {
        $locale = $this->userLocale($customer);
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $consultantName = (string) ($ticket->consultant?->name ?? __('notifications.email.default_consultant', [], $locale));
        $formattedDate = $scheduledAt->format('l, F j, Y \a\t g:i A');

        $meetSection = $meetLink
            ? $this->ctaButton(__('notifications.email.join_meeting', [], $locale), $meetLink)
            : "<p><strong>".__('notifications.email.meeting_no_link', [], $locale)."</strong></p>";

        $html = "<h2>".__('notifications.email.meeting_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $customer->name], $locale)."</p>"
            . "<p>".__('notifications.email.meeting_body', [], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_ticket', [], $locale)."</strong> {$ticketNumber}<br>"
            . "<strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}<br>"
            . "<strong>".__('notifications.email.label_consultant', [], $locale)."</strong> {$consultantName}<br>"
            . "<strong>".__('notifications.email.label_date', [], $locale)."</strong> {$formattedDate}<br>"
            . "<strong>".__('notifications.email.label_duration', [], $locale)."</strong> {$durationMinutes} minutes</p>"
            . $meetSection
            . "<p style=\"color:#666;font-size:13px;\">".__('notifications.email.meeting_early', [], $locale)."</p>";

        $this->sendViaResend(
            $customer->email,
            __('notifications.email.meeting_subject', ['ticket_number' => $ticketNumber], $locale),
            $html,
            'meeting_scheduled',
            ['ticket_id' => $ticket->id]
        );
    }

    // ── Booking link email ─────────────────────────────────────────

    public function sendBookingLink(User $customer, Ticket $ticket, string $bookingUrl): void
    {
        $locale = $this->userLocale($customer);
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $consultantName = (string) ($ticket->consultant?->name ?? __('notifications.email.default_consultant', [], $locale));

        $html = "<h2>".__('notifications.email.booking_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $customer->name], $locale)."</p>"
            . "<p>".__('notifications.email.booking_body', ['consultant_name' => $consultantName, 'property_name' => $propertyName, 'ticket_number' => $ticketNumber], $locale)."</p>"
            . "<p>".__('notifications.email.booking_pick_time', [], $locale)."</p>"
            . $this->ctaButton(__('notifications.email.book_time', [], $locale), $bookingUrl)
            . "<p style=\"color:#666;font-size:13px;\">".__('notifications.email.booking_note', [], $locale)."</p>";

        $this->sendViaResend(
            $customer->email,
            __('notifications.email.booking_subject', ['ticket_number' => $ticketNumber], $locale),
            $html,
            'booking_link',
            ['ticket_id' => $ticket->id]
        );
    }

    // ── Form emails ───────────────────────────────────────────────

    public function sendFormInvitation(
        string $customerEmail,
        Ticket $ticket,
        string $templateName,
        string $formUrl,
    ): void {
        // Attempt to resolve locale from ticket customer
        $locale = $ticket->customer?->profile?->preferred_language ?? 'en';
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $consultantName = (string) ($ticket->consultant?->name ?? __('notifications.email.default_consultant', [], $locale));

        $html = "<h2>".__('notifications.email.form_invitation_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello_generic', [], $locale)."</p>"
            . "<p>".__('notifications.email.form_invitation_body', ['consultant_name' => $consultantName], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_form', [], $locale)."</strong> {$templateName}<br>"
            . "<strong>".__('notifications.email.label_ticket', [], $locale)."</strong> {$ticketNumber}<br>"
            . "<strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}</p>"
            . "<p>".__('notifications.email.form_invitation_please_complete', [], $locale)."</p>"
            . $this->ctaButton(__('notifications.email.fill_form', [], $locale), $formUrl)
            . "<p style=\"color:#666;font-size:13px;\">".__('notifications.email.form_invitation_expiry', [], $locale)."</p>";

        $this->sendViaResend(
            $customerEmail,
            __('notifications.email.form_invitation_subject', ['template_name' => $templateName, 'ticket_number' => $ticketNumber], $locale),
            $html,
            'form_invitation',
            ['ticket_id' => $ticket->id]
        );
    }

    public function sendFormCompleted(
        User $consultant,
        Ticket $ticket,
        string $templateName,
    ): void {
        $locale = $this->userLocale($consultant);
        $ticketNumber = (string) $ticket->ticket_number;
        $customerEmail = (string) ($ticket->customer?->email ?? 'customer');
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/consultant/tickets/{$ticket->id}";

        $html = "<h2>".__('notifications.email.form_completed_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $consultant->name], $locale)."</p>"
            . "<p>".__('notifications.email.form_completed_body', ['customer_email' => $customerEmail, 'template_name' => $templateName, 'ticket_number' => $ticketNumber], $locale)."</p>"
            . "<p>".__('notifications.email.form_completed_review', [], $locale)."</p>"
            . $this->ctaButton(__('notifications.email.view_ticket_detail', [], $locale), $ticketUrl);

        $this->sendViaResend(
            $consultant->email,
            __('notifications.email.form_completed_subject', ['template_name' => $templateName, 'ticket_number' => $ticketNumber], $locale),
            $html,
            'form_completed',
            ['ticket_id' => $ticket->id]
        );
    }

    // ── Private helpers ───────────────────────────────────────────

    private function sendTicketEmail(User $user, Ticket $ticket, string $message): void
    {
        $locale = $this->userLocale($user);
        $ticketNumber = (string) $ticket->ticket_number;
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/tickets/{$ticket->id}";

        $html = "<h2>".__('notifications.email.ticket_update_heading', ['ticket_number' => $ticketNumber], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $user->name], $locale)."</p>"
            . "<p>{$message}</p>"
            . $this->ctaButton(__('notifications.email.view_ticket', [], $locale), $ticketUrl);

        $this->sendViaResend(
            $user->email,
            __('notifications.email.ticket_update_subject', ['ticket_number' => $ticketNumber], $locale),
            $html,
            'ticket_update',
            ['ticket_id' => $ticket->id]
        );
    }

    private function sendOrderEmail(User $user, Order $order, string $event, string $label): void
    {
        $locale = $this->userLocale($user);
        $orderNumber = (string) $order->order_number;
        $total = number_format((float) $order->total, 2);
        $currency = strtoupper((string) $order->currency);
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $orderUrl = "{$frontendUrl}/dashboard/orders/{$order->id}";

        $html = "<h2>{$label}</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $user->name], $locale)."</p>"
            . "<p>".__('notifications.email.order_body', ['order_number' => $orderNumber, 'currency' => $currency, 'total' => $total, 'event' => $event], $locale)."</p>"
            . $this->ctaButton(__('notifications.email.view_order', [], $locale), $orderUrl);

        $this->sendViaResend(
            $user->email,
            __('notifications.email.order_subject', ['label' => $label, 'order_number' => $orderNumber], $locale),
            $html,
            "order_{$event}",
            ['order_id' => $order->id]
        );
    }

    private function ctaButton(string $label, string $url): string
    {
        return "<p><a href=\"{$url}\" style=\"background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;\">{$label}</a></p>";
    }

    private function userLocale(User $user): string
    {
        return $user->profile?->preferred_language ?? App::getLocale();
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
