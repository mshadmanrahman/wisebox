<?php

return [

    // ── Auth ────────────────────────────────────────────────────────
    'invalid_credentials' => 'অবৈধ তথ্য।',
    'account_suspended' => 'আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।',
    'no_admin_access' => 'এই অ্যাকাউন্টে অ্যাডমিন অ্যাক্সেস নেই।',
    'no_consultant_access' => 'এই অ্যাকাউন্টে পরামর্শদাতা অ্যাক্সেস নেই।',
    'logged_out' => 'সফলভাবে লগ আউট হয়েছে।',
    'invalid_google_token' => 'অবৈধ বা মেয়াদোত্তীর্ণ Google টোকেন।',
    'google_email_missing' => 'Google অ্যাকাউন্ট থেকে ইমেইল পাওয়া যায়নি।',
    'password_reset_link_sent' => 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।',
    'password_reset_done' => 'পাসওয়ার্ড রিসেট হয়েছে।',
    'otp_invalid' => 'অবৈধ বা মেয়াদোত্তীর্ণ OTP কোড।',
    'otp_verified' => 'OTP সফলভাবে যাচাই হয়েছে।',
    'otp_sent' => 'OTP কোড সফলভাবে পাঠানো হয়েছে।',
    'current_password_incorrect' => 'বর্তমান পাসওয়ার্ড ভুল।',
    'password_updated' => 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।',

    // ── Ticket ──────────────────────────────────────────────────────
    'forbidden' => 'অননুমোদিত',
    'consultant_assigned' => 'পরামর্শদাতা সফলভাবে নিযুক্ত হয়েছেন।',
    'comment_or_attachment_required' => 'একটি মন্তব্য বা অন্তত একটি সংযুক্তি প্রয়োজন।',
    'internal_comment_restricted' => 'শুধুমাত্র পরামর্শদাতা এবং অ্যাডমিন অভ্যন্তরীণ মন্তব্য করতে পারেন।',
    'no_consultant_assigned' => 'এই টিকেটে এখনও কোনো পরামর্শদাতা নিযুক্ত হননি।',
    'no_preferred_slots' => 'এই টিকেটে কোনো পছন্দের সময় নেই।',
    'invalid_slot_index' => 'অবৈধ স্লট ইনডেক্স।',
    'slot_missing_datetime' => 'নির্বাচিত স্লটে তারিখ বা সময়ের তথ্য নেই।',
    'no_customer_on_ticket' => 'এই টিকেটে কোনো গ্রাহক নেই।',
    'customer_no_email' => 'গ্রাহকের ইমেইল ঠিকানা নেই।',
    'customer_no_valid_email' => 'এই টিকেটে বৈধ ইমেইলসহ কোনো গ্রাহক নেই।',

    // ── Property ────────────────────────────────────────────────────
    'property_deleted' => 'সম্পত্তি মুছে ফেলা হয়েছে।',
    'co_owner_percentage_exceeded' => 'সহ-মালিকদের শতাংশ ১০০% অতিক্রম করতে পারবে না।',
    'co_owner_total_error' => 'মোট :total% এবং ১০০% বা তার কম হতে হবে।',

    // ── Order ───────────────────────────────────────────────────────
    'services_unavailable' => 'এক বা একাধিক নির্বাচিত সেবা পাওয়া যাচ্ছে না।',
    'order_already_paid' => 'অর্ডারের পেমেন্ট ইতিমধ্যে সম্পন্ন হয়েছে।',
    'only_pending_checkout' => 'শুধুমাত্র মুলতুবি অর্ডার চেকআউট করা যাবে।',
    'only_pending_cancel' => 'শুধুমাত্র মুলতুবি অর্ডার বাতিল করা যাবে।',
    'order_cancelled' => 'অর্ডার বাতিল হয়েছে।',

    // ── Admin Consultation ──────────────────────────────────────────
    'admin_required' => 'অননুমোদিত: অ্যাডমিন অ্যাক্সেস প্রয়োজন।',
    'only_pending_approve' => 'শুধুমাত্র মুলতুবি পরামর্শ অনুরোধ অনুমোদন করা যাবে।',
    'consultant_not_found' => 'নির্বাচিত পরামর্শদাতা পাওয়া যায়নি বা সক্রিয় নন।',
    'consultation_approved' => 'পরামর্শ অনুমোদিত এবং পরামর্শদাতা নিযুক্ত হয়েছেন।',
    'only_pending_reject' => 'শুধুমাত্র মুলতুবি পরামর্শ অনুরোধ প্রত্যাখ্যান করা যাবে।',
    'consultation_rejected' => 'পরামর্শ অনুরোধ প্রত্যাখ্যাত হয়েছে।',

    // ── Free Consultation ───────────────────────────────────────────
    'property_not_found_or_not_owned' => 'সম্পত্তি পাওয়া যায়নি বা আপনার মালিকানায় নেই।',
    'active_consultation_exists' => 'এই সম্পত্তির জন্য আপনার ইতিমধ্যে একটি সক্রিয় পরামর্শ অনুরোধ রয়েছে।',
    'free_consultation_submitted' => 'আপনার বিনামূল্যে পরামর্শ অনুরোধ জমা হয়েছে। একজন পরামর্শদাতা নিযুক্ত হলে আপনি নিশ্চিতকরণ পাবেন।',

    // ── Document ────────────────────────────────────────────────────
    'document_marked_missing' => 'দলিল অনুপস্থিত হিসেবে চিহ্নিত হয়েছে।',
    'no_file_available' => 'এই দলিলের জন্য কোনো ফাইল পাওয়া যায়নি।',
    'file_not_found' => 'স্টোরেজে ফাইল পাওয়া যায়নি।',
    'document_not_belongs' => 'দলিলটি এই সম্পত্তির অন্তর্ভুক্ত নয়।',
    'document_deleted' => 'দলিল মুছে ফেলা হয়েছে।',

    // ── Notification ────────────────────────────────────────────────
    'notification_not_found' => 'বিজ্ঞপ্তি পাওয়া যায়নি।',
    'notification_marked_read' => 'বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে।',
    'all_notifications_read' => 'সব বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে।',

    // ── In-app notification titles/bodies ───────────────────────────
    'notif_ticket_status_updated_title' => 'টিকেটের স্থিতি আপডেট হয়েছে',
    'notif_ticket_status_updated_body' => 'টিকেট :ticket_number এখন :status।',
    'notif_ticket_completed_title' => 'টিকেট সম্পন্ন',
    'notif_ticket_completed_body' => 'টিকেট :ticket_number সম্পন্ন হিসেবে চিহ্নিত হয়েছে।',
    'notif_ticket_assigned_title' => 'নতুন টিকেট নিযুক্ত',
    'notif_ticket_assigned_body' => 'আপনাকে টিকেট :ticket_number-এ নিযুক্ত করা হয়েছে।',
    'notif_consultant_assigned_title' => 'পরামর্শদাতা নিযুক্ত',
    'notif_consultant_assigned_body' => 'টিকেট :ticket_number-এ একজন পরামর্শদাতা নিযুক্ত হয়েছেন।',
    'notif_customer_comment_title' => 'গ্রাহকের মন্তব্য যোগ হয়েছে',
    'notif_customer_comment_body' => 'টিকেট :ticket_number-এ একটি নতুন গ্রাহক মন্তব্য যোগ হয়েছে।',
    'notif_consultant_comment_title' => 'পরামর্শদাতা টিকেট আপডেট করেছেন',
    'notif_consultant_comment_body' => 'টিকেট :ticket_number-এ একটি নতুন আপডেট পোস্ট হয়েছে।',
    'notif_meeting_scheduled_title' => 'মিটিং নির্ধারিত',
    'notif_meeting_scheduled_body' => 'টিকেট :ticket_number-এর জন্য আপনার পরামর্শ :datetime-এ নির্ধারিত হয়েছে।',
    'notif_booking_link_title' => 'আপনার পরামর্শ বুক করুন',
    'notif_booking_link_body' => 'আপনার পরামর্শদাতা টিকেট :ticket_number-এর জন্য মিটিং শিডিউল করার লিংক পাঠিয়েছেন। আপনার ইমেইল দেখুন।',
    'notif_form_sent_title' => 'পরামর্শ ফর্ম অনুরোধ',
    'notif_form_sent_body' => 'আপনার পরামর্শদাতা টিকেট :ticket_number-এর জন্য একটি ফর্ম পূরণ করতে পাঠিয়েছেন। আপনার ইমেইল দেখুন।',
    'notif_consultation_assigned_title' => 'নতুন পরামর্শ নিযুক্ত',
    'notif_consultation_assigned_body' => ':customer_name সম্পত্তি: :property_name-এর জন্য বিনামূল্যে পরামর্শ অনুরোধ করেছেন এবং আপনাকে নিযুক্ত করা হয়েছে।',
    'notif_consultation_approved_title' => 'পরামর্শ অনুরোধ অনুমোদিত',
    'notif_consultation_approved_body' => ':property_name-এর জন্য আপনার বিনামূল্যে পরামর্শ অনুরোধ অনুমোদিত হয়েছে। একজন পরামর্শদাতা শীঘ্রই মিটিংয়ের সময় নিশ্চিত করতে আপনার সাথে যোগাযোগ করবেন।',
    'notif_consultation_rejected_title' => 'পরামর্শ অনুরোধ আপডেট',
    'notif_consultation_rejected_body' => ':property_name-এর জন্য আপনার বিনামূল্যে পরামর্শ অনুরোধ প্রক্রিয়া করা যায়নি। কারণ: :reason',
    'notif_new_consultation_title' => 'নতুন বিনামূল্যে পরামর্শ অনুরোধ',
    'notif_new_consultation_body' => ':customer_name সম্পত্তি: :property_name-এর জন্য বিনামূল্যে পরামর্শ অনুরোধ করেছেন।',
];
