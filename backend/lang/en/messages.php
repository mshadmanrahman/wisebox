<?php

return [

    // ── Auth ────────────────────────────────────────────────────────
    'invalid_credentials' => 'Invalid credentials.',
    'account_suspended' => 'Your account has been suspended.',
    'no_admin_access' => 'This account does not have admin access.',
    'no_consultant_access' => 'This account does not have consultant access.',
    'logged_out' => 'Logged out successfully.',
    'invalid_google_token' => 'Invalid or expired Google token.',
    'google_email_missing' => 'Could not retrieve email from Google account.',
    'password_reset_link_sent' => 'Password reset link sent to your email.',
    'password_reset_done' => 'Password has been reset.',
    'otp_invalid' => 'Invalid or expired OTP code.',
    'otp_verified' => 'OTP verified successfully.',
    'otp_sent' => 'OTP code sent successfully.',
    'current_password_incorrect' => 'The current password is incorrect.',
    'password_updated' => 'Password updated successfully.',

    // ── Ticket ──────────────────────────────────────────────────────
    'forbidden' => 'Forbidden',
    'consultant_assigned' => 'Consultant assigned successfully.',
    'comment_or_attachment_required' => 'A comment body or at least one attachment is required.',
    'internal_comment_restricted' => 'Only consultants and admins can create internal comments.',
    'no_consultant_assigned' => 'This ticket has no assigned consultant yet.',
    'no_preferred_slots' => 'This ticket does not have preferred time slots.',
    'invalid_slot_index' => 'Invalid slot index.',
    'slot_missing_datetime' => 'Selected slot is missing date or time information.',
    'no_customer_on_ticket' => 'This ticket has no customer.',
    'customer_no_email' => 'Customer has no email address.',
    'customer_no_valid_email' => 'This ticket does not have a customer with a valid email.',

    // ── Property ────────────────────────────────────────────────────
    'property_deleted' => 'Property deleted.',
    'co_owner_percentage_exceeded' => 'Co-owner percentages cannot exceed 100%.',
    'co_owner_total_error' => 'Total is :total% and must be 100% or less.',

    // ── Order ───────────────────────────────────────────────────────
    'services_unavailable' => 'One or more selected services are unavailable.',
    'order_already_paid' => 'Order is already paid.',
    'only_pending_checkout' => 'Only pending orders can be checked out.',
    'only_pending_cancel' => 'Only pending orders can be cancelled.',
    'order_cancelled' => 'Order cancelled.',

    // ── Admin Consultation ──────────────────────────────────────────
    'admin_required' => 'Forbidden: Admin access required.',
    'only_pending_approve' => 'Only pending consultation requests can be approved.',
    'consultant_not_found' => 'Selected consultant not found or is not active.',
    'consultation_approved' => 'Consultation approved and consultant assigned.',
    'only_pending_reject' => 'Only pending consultation requests can be rejected.',
    'consultation_rejected' => 'Consultation request rejected.',

    // ── Free Consultation ───────────────────────────────────────────
    'property_not_found_or_not_owned' => 'Property not found or does not belong to you.',
    'active_consultation_exists' => 'You already have an active consultation request for this property.',
    'free_consultation_submitted' => 'Your free consultation request has been submitted. You will receive a confirmation once a consultant is assigned.',

    // ── Document ────────────────────────────────────────────────────
    'document_marked_missing' => 'Document marked as missing.',
    'no_file_available' => 'No file available for this document.',
    'file_not_found' => 'File not found on storage.',
    'document_not_belongs' => 'Document does not belong to this property.',
    'document_deleted' => 'Document deleted.',

    // ── Notification ────────────────────────────────────────────────
    'notification_not_found' => 'Notification not found.',
    'notification_marked_read' => 'Notification marked as read.',
    'all_notifications_read' => 'All notifications marked as read.',

    // ── In-app notification titles/bodies (from createNotification calls) ─
    'notif_ticket_status_updated_title' => 'Ticket status updated',
    'notif_ticket_status_updated_body' => 'Ticket :ticket_number is now :status.',
    'notif_ticket_completed_title' => 'Ticket completed',
    'notif_ticket_completed_body' => 'Ticket :ticket_number has been marked as completed.',
    'notif_ticket_assigned_title' => 'New ticket assigned',
    'notif_ticket_assigned_body' => 'You have been assigned to ticket :ticket_number.',
    'notif_consultant_assigned_title' => 'Consultant assigned',
    'notif_consultant_assigned_body' => 'A consultant has been assigned to ticket :ticket_number.',
    'notif_customer_comment_title' => 'Customer comment added',
    'notif_customer_comment_body' => 'A new customer comment was added to ticket :ticket_number.',
    'notif_consultant_comment_title' => 'Ticket updated by consultant',
    'notif_consultant_comment_body' => 'A new update was posted on ticket :ticket_number.',
    'notif_meeting_scheduled_title' => 'Meeting scheduled',
    'notif_meeting_scheduled_body' => 'Your consultation for ticket :ticket_number has been scheduled for :datetime.',
    'notif_booking_link_title' => 'Book your consultation',
    'notif_booking_link_body' => 'Your consultant has sent you a link to schedule your meeting for ticket :ticket_number. Check your email.',
    'notif_form_sent_title' => 'Consultation form requested',
    'notif_form_sent_body' => 'Your consultant has sent you a form to complete for ticket :ticket_number. Check your email.',
    'notif_consultation_assigned_title' => 'New Consultation Assigned',
    'notif_consultation_assigned_body' => 'You have been assigned a free consultation request from :customer_name for property: :property_name.',
    'notif_consultation_approved_title' => 'Consultation Request Approved',
    'notif_consultation_approved_body' => 'Your free consultation request for :property_name has been approved. A consultant will contact you shortly to confirm the meeting time.',
    'notif_consultation_rejected_title' => 'Consultation Request Update',
    'notif_consultation_rejected_body' => 'Your free consultation request for :property_name could not be processed. Reason: :reason',
    'notif_new_consultation_title' => 'New Free Consultation Request',
    'notif_new_consultation_body' => ':customer_name has requested a free consultation for property: :property_name.',
];
