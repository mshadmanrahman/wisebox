<?php

return [

    // ── OTP ─────────────────────────────────────────────────────────
    'otp' => [
        'subject' => 'Your Wisebox verification code',
        'greeting' => 'Hello :name,',
        'line1' => 'Use this verification code to continue:',
        'expires' => 'This code will expire in :minutes minutes.',
        'ignore' => 'If you did not request this code, you can safely ignore this message.',
        'sms' => 'Your Wisebox verification code is :code. It expires in :minutes minutes.',
    ],

    // ── OTP Service errors ──────────────────────────────────────────
    'otp_rate_limited' => 'Please wait at least 60 seconds before requesting a new OTP.',
    'otp_phone_required' => 'A phone number is required for SMS OTP delivery.',

    // ── Ticket Created ──────────────────────────────────────────────
    'ticket_created' => [
        'subject' => 'Consultation Request Submitted: :property_name',
        'greeting' => 'Hello :name,',
        'submitted' => 'Your request for a free consultation for **:property_name** has been submitted.',
        'ticket_label' => 'Ticket: :ticket_number',
        'service_label' => 'Service: :service_name',
        'next_steps' => 'What happens next? Our team will review your request and assign a qualified consultant. You will receive an email once a consultant has been assigned.',
        'view_ticket' => 'View Ticket',
        'thank_you' => 'Thank you for choosing Wisebox.',
    ],

    // ── Ticket Lifecycle ────────────────────────────────────────────
    'ticket_lifecycle' => [
        'ticket_label' => 'Ticket: :ticket_number',
        'current_status' => 'Current status: :status',
        'view_ticket' => 'View Ticket',

        'assigned' => [
            'subject' => 'Ticket assigned',
            'body' => 'A consultant has been assigned to this ticket.',
        ],
        'status_updated' => [
            'subject' => 'Ticket status updated',
            'body' => 'Status changed from :from_status to :to_status.',
        ],
        'comment_added' => [
            'subject' => 'New ticket comment',
            'body' => ':actor posted a new comment on this ticket.',
            'body_default' => 'A consultant posted a new comment on this ticket.',
        ],
        'default' => [
            'subject' => 'Ticket update',
            'body' => 'There is an update on your ticket.',
        ],
    ],

    // ── Order Lifecycle ─────────────────────────────────────────────
    'order_lifecycle' => [
        'order_label' => 'Order: :order_number',
        'total_label' => 'Total: :total :currency',
        'view_order' => 'View Order',

        'created' => [
            'subject' => 'Order received',
            'body' => 'We received your order and it is pending payment.',
        ],
        'paid' => [
            'subject' => 'Payment confirmed',
            'body' => 'Your payment has been confirmed and processing has started.',
        ],
        'failed' => [
            'subject' => 'Payment failed',
            'body' => 'Your payment attempt failed. Please try checkout again.',
        ],
        'cancelled' => [
            'subject' => 'Order cancelled',
            'body' => 'Your order has been cancelled.',
        ],
        'refunded' => [
            'subject' => 'Order refunded',
            'body' => 'Your payment has been refunded and the order is closed.',
        ],
        'default' => [
            'subject' => 'Order update',
            'body' => 'There is an update on your order.',
        ],
    ],

    // ── Meeting Scheduled ───────────────────────────────────────────
    'meeting_scheduled' => [
        'subject' => 'Consultation Scheduled: :property_name',
        'greeting' => 'Hello :name,',
        'scheduled' => 'Your free consultation for **:property_name** has been scheduled!',
        'date_label' => 'Date: :date',
        'time_label' => 'Time: :time (Bangladesh Standard Time)',
        'duration_label' => 'Duration: :minutes minutes',
        'consultant_label' => 'Consultant: :consultant_name',
        'ticket_label' => 'Ticket: :ticket_number',
        'join_meeting' => 'Join Google Meet',
        'access_note' => 'You can also access the meeting link from your ticket page.',
        'punctuality' => 'Please join the meeting on time. If you need to reschedule, contact us through your ticket.',
        'alarm_30' => 'Consultation in 30 minutes',
        'alarm_15' => 'Consultation in 15 minutes',
    ],

    // ── Form Invitation ─────────────────────────────────────────────
    'form_invitation' => [
        'subject' => 'Please complete: :template_name for :ticket_number',
        'greeting' => 'Hello,',
        'request' => 'Your consultant **:consultant_name** has requested you to fill out a form for your property consultation.',
        'form_label' => 'Form: :template_name',
        'ticket_label' => 'Ticket: :ticket_number',
        'property_label' => 'Property: :property_name',
        'please_complete' => 'Please complete this form at your earliest convenience to help us assist you better.',
        'fill_form' => 'Fill Out Form',
        'expiry_note' => 'This link will expire in 7 days. No login is required to complete the form.',
    ],

    // ── Form Completed ──────────────────────────────────────────────
    'form_completed' => [
        'subject' => 'Form completed: :template_name for :ticket_number',
        'greeting' => 'Hello :name,',
        'completed' => 'The customer (**:customer_email**) has completed the consultation form you sent.',
        'form_label' => 'Form: :template_name',
        'ticket_label' => 'Ticket: :ticket_number',
        'view_responses' => 'View Responses',
        'review_note' => 'You can review the responses from the ticket detail page.',
    ],

    // ── Transactional Email Service ─────────────────────────────────
    'email' => [
        'hello' => 'Hello :name,',
        'hello_generic' => 'Hello,',

        'ticket_update_heading' => 'Ticket Update: :ticket_number',
        'ticket_update_subject' => 'Update for ticket :ticket_number',
        'ticket_assigned_message' => 'A consultant has been assigned to your ticket.',
        'ticket_status_updated' => 'Your ticket status has been updated to <strong>:status</strong>.',
        'ticket_status_updated_was' => 'Your ticket status has been updated to <strong>:status</strong> (was: :from_status).',
        'ticket_comment_added' => ':actor added a comment to your ticket.',
        'view_ticket' => 'View Ticket',

        'ticket_created_heading' => 'Your Ticket Has Been Created',
        'ticket_created_body' => 'Your consultation request has been submitted successfully.',
        'ticket_created_consultant_note' => 'A consultant will be assigned shortly. You\'ll receive an email when there\'s an update.',
        'ticket_created_subject' => 'Ticket :ticket_number created for :property_name',

        'meeting_heading' => 'Consultation Meeting Scheduled',
        'meeting_body' => 'Your consultation meeting has been scheduled.',
        'meeting_no_link' => 'Your consultant will share the meeting link separately.',
        'meeting_early' => 'Please join a few minutes early. If you need to reschedule, contact your consultant.',
        'meeting_subject' => 'Meeting scheduled for :ticket_number',
        'join_meeting' => 'Join Meeting',

        'booking_heading' => 'Schedule Your Consultation',
        'booking_body' => 'Your consultant <strong>:consultant_name</strong> is ready to meet with you regarding <strong>:property_name</strong> (ticket :ticket_number).',
        'booking_pick_time' => 'Please pick a time that works for you:',
        'booking_note' => 'This is a one-time link. Once you book, you\'ll receive a confirmation with meeting details.',
        'booking_subject' => 'Schedule your consultation for :ticket_number',
        'book_time' => 'Book a Time',

        'form_invitation_heading' => 'Consultation Form Request',
        'form_invitation_body' => 'Your consultant <strong>:consultant_name</strong> has requested you to fill out a form for your property consultation.',
        'form_invitation_please_complete' => 'Please complete this form at your earliest convenience to help us assist you better.',
        'form_invitation_expiry' => 'This link will expire in 7 days. No login is required to complete the form.',
        'form_invitation_subject' => 'Please complete: :template_name for :ticket_number',
        'fill_form' => 'Fill Out Form',

        'form_completed_heading' => 'Form Completed by Customer',
        'form_completed_body' => 'The customer (:customer_email) has completed the <strong>:template_name</strong> form for ticket :ticket_number.',
        'form_completed_review' => 'Review the responses and proceed with the consultation.',
        'form_completed_subject' => 'Form completed: :template_name for :ticket_number',
        'view_ticket_detail' => 'View Ticket',

        'order_subject' => ':label: :order_number',
        'order_body' => 'Your order <strong>:order_number</strong> (:currency :total) has been :event.',
        'view_order' => 'View Order',

        'label_ticket' => 'Ticket:',
        'label_property' => 'Property:',
        'label_service' => 'Service:',
        'label_consultant' => 'Consultant:',
        'label_date' => 'Date:',
        'label_duration' => 'Duration:',
        'label_form' => 'Form:',

        'default_property' => 'Your Property',
        'default_service' => 'Property Consultation',
        'default_consultant' => 'Wisebox Consultant',
    ],
];
