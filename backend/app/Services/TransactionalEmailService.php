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

    // ── Admin notification emails ──────────────────────────────────

    public function sendAdminNewOrder(User $admin, Order $order): void
    {
        $locale = $this->userLocale($admin);
        $orderNumber = (string) $order->order_number;
        $total = number_format((float) $order->total, 2);
        $currency = strtoupper((string) $order->currency);
        $customerName = $this->safeName($order->user?->name ?? 'Unknown Customer');
        $propertyName = (string) ($order->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $ticketsCreated = $order->tickets?->count() ?? 0;
        $adminUrl = rtrim((string) config('services.frontend.url', 'http://localhost:3000'), '/') . '/admin/consultations';

        $html = "<h2>New Paid Order — Action Required</h2>"
            . "<p>Hello {$this->safeName($admin->name)},</p>"
            . "<p>A new order has been paid and <strong>{$ticketsCreated}</strong> ticket(s) are awaiting consultant assignment.</p>"
            . "<p><strong>Order:</strong> {$orderNumber}<br>"
            . "<strong>Customer:</strong> {$customerName}<br>"
            . "<strong>Property:</strong> {$propertyName}<br>"
            . "<strong>Total:</strong> {$currency} {$total}</p>"
            . $this->ctaButton('Assign Consultants', $adminUrl);

        $this->sendViaResend(
            $admin->email,
            "New Order {$orderNumber} — Consultant Assignment Needed",
            $html,
            'admin_new_order',
            ['order_id' => $order->id]
        );
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
        $body = $commentBody ? '<blockquote>' . e($commentBody) . '</blockquote>' : '';
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
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($customer->name)], $locale)."</p>"
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
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($customer->name)], $locale)."</p>"
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

    public function sendConsultantMeetingScheduled(
        User $consultant,
        Ticket $ticket,
        string $meetLink,
        \Carbon\Carbon $scheduledAt,
        int $durationMinutes,
    ): void {
        $locale = $this->userLocale($consultant);
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $customerName = $this->safeName($ticket->customer?->name ?? 'Customer');
        $formattedDate = $scheduledAt->format('l, F j, Y \a\t g:i A');
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = "{$frontendUrl}/consultant/tickets/{$ticket->id}";

        $meetSection = $meetLink
            ? $this->ctaButton(__('notifications.email.join_meeting', [], $locale), $meetLink)
            : "<p><strong>".__('notifications.email.meeting_no_link', [], $locale)."</strong></p>";

        $html = "<h2>".__('notifications.email.consultant_meeting_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($consultant->name)], $locale)."</p>"
            . "<p>".__('notifications.email.consultant_meeting_body', ['customer_name' => $customerName], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_ticket', [], $locale)."</strong> {$ticketNumber}<br>"
            . "<strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}<br>"
            . "<strong>".__('notifications.email.label_date', [], $locale)."</strong> {$formattedDate}<br>"
            . "<strong>".__('notifications.email.label_duration', [], $locale)."</strong> {$durationMinutes} minutes</p>"
            . $meetSection
            . "<p>".$this->ctaButton(__('notifications.email.view_ticket', [], $locale), $ticketUrl)."</p>";

        $this->sendViaResend(
            $consultant->email,
            __('notifications.email.consultant_meeting_subject', ['ticket_number' => $ticketNumber, 'customer_name' => $customerName], $locale),
            $html,
            'consultant_meeting_scheduled',
            ['ticket_id' => $ticket->id]
        );
    }

    public function sendAdminFreeConsultation(User $admin, Ticket $ticket, User $customer): void
    {
        $locale = $this->userLocale($admin);
        $ticketNumber = (string) $ticket->ticket_number;
        $propertyName = (string) ($ticket->property?->property_name ?? __('notifications.email.default_property', [], $locale));
        $adminUrl = rtrim((string) config('services.frontend.url', 'http://localhost:3000'), '/') . '/admin/consultations';

        $html = "<h2>".__('notifications.email.admin_free_consultation_heading', [], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($admin->name)], $locale)."</p>"
            . "<p>".__('notifications.email.admin_free_consultation_body', ['customer_name' => $this->safeName($customer->name), 'property_name' => $propertyName], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_ticket', [], $locale)."</strong> {$ticketNumber}<br>"
            . "<strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}</p>"
            . $this->ctaButton(__('notifications.email.admin_free_consultation_cta', [], $locale), $adminUrl);

        $this->sendViaResend(
            $admin->email,
            __('notifications.email.admin_free_consultation_subject', ['ticket_number' => $ticketNumber], $locale),
            $html,
            'admin_free_consultation',
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
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($customer->name)], $locale)."</p>"
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
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($consultant->name)], $locale)."</p>"
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

    // ── Assessment email ────────────────────────────────────────────

    public function sendAssessmentResults(
        User $user,
        int $score,
        string $status,
        string $summary,
        array $gaps,
        bool $isNewUser,
    ): void {
        $locale = $this->userLocale($user);
        $frontendUrl = rtrim((string) config('services.frontend.url', 'http://localhost:3000'), '/');

        $statusLabel = match ($status) {
            'green' => 'Strong',
            'yellow' => 'Needs Attention',
            default => 'At Risk',
        };
        $statusColor = match ($status) {
            'green' => '#16a34a',
            'yellow' => '#d97706',
            default => '#dc2626',
        };

        $gapsHtml = '';
        if (!empty($gaps)) {
            $gapsHtml = '<p><strong>Gaps identified:</strong></p><ul style="margin:8px 0;padding-left:20px;">';
            foreach (array_slice($gaps, 0, 10) as $gap) {
                $gapsHtml .= '<li>' . e($gap) . '</li>';
            }
            $gapsHtml .= '</ul>';
            if (count($gaps) > 10) {
                $gapsHtml .= '<p style="color:#666;font-size:13px;">...and ' . (count($gaps) - 10) . ' more. View all in your dashboard.</p>';
            }
        }

        $accountSection = $isNewUser
            ? '<p><strong>Your Wisebox account has been created.</strong> You can log in with your email address. We recommend setting a password from your dashboard settings.</p>'
            : '<p>Results have been saved to your existing Wisebox account.</p>';

        $dashboardUrl = "{$frontendUrl}/dashboard";
        $loginUrl = "{$frontendUrl}/login";
        $ctaUrl = $isNewUser ? $loginUrl : $dashboardUrl;
        $ctaLabel = $isNewUser ? 'Log in to your dashboard' : 'View your dashboard';

        $html = '<h2>Your Property Assessment Results</h2>'
            . '<p>Hello ' . $this->safeName($user->name) . ',</p>'
            . '<p>' . e($summary) . '</p>'
            . '<p><strong>Score:</strong> ' . $score . '/100<br>'
            . '<strong>Status:</strong> <span style="color:' . $statusColor . ';font-weight:bold;">' . $statusLabel . '</span></p>'
            . $gapsHtml
            . $accountSection
            . '<p>A draft property called <strong>"Free Assessment"</strong> has been created in your dashboard. You can rename it, add documents, and book a free consultation from there.</p>'
            . $this->ctaButton($ctaLabel, $ctaUrl)
            . '<p style="color:#666;font-size:13px;">If you did not request this assessment, you can ignore this email.</p>';

        $this->sendViaResend(
            $user->email,
            "Your Property Assessment: {$statusLabel} ({$score}/100)",
            $html,
            'assessment_results',
            ['user_id' => $user->id, 'score' => $score, 'status' => $status]
        );
    }

    // ── Private helpers ───────────────────────────────────────────

    private function sendTicketEmail(User $user, Ticket $ticket, string $message): void
    {
        $locale = $this->userLocale($user);
        $ticketNumber = (string) $ticket->ticket_number;
        $frontendUrl = (string) config('services.frontend.url', 'http://localhost:3000');
        $ticketUrl = $user->isConsultant()
            ? "{$frontendUrl}/consultant/tickets/{$ticket->id}"
            : "{$frontendUrl}/tickets/{$ticket->id}";

        $html = "<h2>".__('notifications.email.ticket_update_heading', ['ticket_number' => $ticketNumber], $locale)."</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($user->name)], $locale)."</p>"
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

        // Load relations for enrichment if not already loaded
        $order->loadMissing(['items.service', 'property']);

        $propertyName = $order->property?->property_name ?? __('notifications.email.default_property', [], $locale);

        // Build service line items summary
        $serviceLines = '';
        if ($order->items && $order->items->isNotEmpty()) {
            $serviceLines = '<ul style="margin:8px 0;padding-left:20px;">';
            foreach ($order->items as $item) {
                $serviceName = $item->service?->name ?? __('notifications.email.default_service', [], $locale);
                $qty = (int) $item->quantity;
                $itemTotal = number_format((float) $item->total_price, 2);
                $serviceLines .= "<li>{$serviceName}" . ($qty > 1 ? " x{$qty}" : '') . " &mdash; {$currency} {$itemTotal}</li>";
            }
            $serviceLines .= '</ul>';
        }

        $html = "<h2>{$label}</h2>"
            . "<p>".__('notifications.email.hello', ['name' => $this->safeName($user->name)], $locale)."</p>"
            . "<p>".__('notifications.email.order_body', ['order_number' => $orderNumber, 'currency' => $currency, 'total' => $total, 'event' => $event], $locale)."</p>"
            . "<p><strong>".__('notifications.email.label_property', [], $locale)."</strong> {$propertyName}</p>"
            . ($serviceLines !== '' ? "<p><strong>".__('notifications.email.label_services', [], $locale)."</strong></p>{$serviceLines}" : '')
            . "<p><strong>".__('notifications.email.label_total', [], $locale)."</strong> {$currency} {$total}</p>"
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
        return '<p><a href="' . e($url) . '" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">' . e($label) . '</a></p>';
    }

    private function userLocale(User $user): string
    {
        return $user->profile?->preferred_language ?? App::getLocale();
    }

    /**
     * HTML-escape a user-supplied name for safe embedding in email HTML.
     * Defense-in-depth: input is also stripped on registration.
     */
    private function safeName(?string $name): string
    {
        return e($name ?? '');
    }

    /**
     * Send email via Resend HTTP API. Bypasses SMTP entirely.
     * https://resend.com/docs/api-reference/emails/send-email
     */
    private function sendViaResend(string $to, string $subject, string $html, string $tag, array $context = []): void
    {
        $apiKey = config('services.resend.key');
        if (empty($apiKey)) {
            Log::warning("Resend API key not configured. Email not sent [{$tag}]", $context);
            return;
        }
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
