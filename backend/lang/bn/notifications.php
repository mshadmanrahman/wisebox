<?php

return [

    // ── OTP ─────────────────────────────────────────────────────────
    'otp' => [
        'subject' => 'আপনার Wisebox যাচাইকরণ কোড',
        'greeting' => 'হ্যালো :name,',
        'line1' => 'চালিয়ে যেতে এই যাচাইকরণ কোড ব্যবহার করুন:',
        'expires' => 'এই কোড :minutes মিনিটে মেয়াদোত্তীর্ণ হবে।',
        'ignore' => 'আপনি যদি এই কোড অনুরোধ না করে থাকেন, তাহলে এই বার্তাটি উপেক্ষা করুন।',
        'sms' => 'আপনার Wisebox যাচাইকরণ কোড :code। এটি :minutes মিনিটে মেয়াদোত্তীর্ণ হবে।',
    ],

    // ── OTP Service errors ──────────────────────────────────────────
    'otp_rate_limited' => 'নতুন OTP অনুরোধ করার আগে অন্তত ৬০ সেকেন্ড অপেক্ষা করুন।',
    'otp_phone_required' => 'SMS OTP পাঠাতে একটি ফোন নম্বর প্রয়োজন।',

    // ── Ticket Created ──────────────────────────────────────────────
    'ticket_created' => [
        'subject' => 'পরামর্শ অনুরোধ জমা হয়েছে: :property_name',
        'greeting' => 'হ্যালো :name,',
        'submitted' => '**:property_name**-এর জন্য আপনার বিনামূল্যে পরামর্শ অনুরোধ জমা হয়েছে।',
        'ticket_label' => 'টিকেট: :ticket_number',
        'service_label' => 'সেবা: :service_name',
        'next_steps' => 'এরপর কী হবে? আমাদের দল আপনার অনুরোধ পর্যালোচনা করবে এবং একজন যোগ্য পরামর্শদাতা নিযুক্ত করবে। পরামর্শদাতা নিযুক্ত হলে আপনি ইমেইল পাবেন।',
        'view_ticket' => 'টিকেট দেখুন',
        'thank_you' => 'Wisebox বেছে নেওয়ার জন্য ধন্যবাদ।',
    ],

    // ── Ticket Lifecycle ────────────────────────────────────────────
    'ticket_lifecycle' => [
        'ticket_label' => 'টিকেট: :ticket_number',
        'current_status' => 'বর্তমান স্থিতি: :status',
        'view_ticket' => 'টিকেট দেখুন',

        'assigned' => [
            'subject' => 'টিকেট নিযুক্ত',
            'body' => 'এই টিকেটে একজন পরামর্শদাতা নিযুক্ত হয়েছেন।',
        ],
        'status_updated' => [
            'subject' => 'টিকেটের স্থিতি আপডেট হয়েছে',
            'body' => 'স্থিতি :from_status থেকে :to_status-এ পরিবর্তিত হয়েছে।',
        ],
        'comment_added' => [
            'subject' => 'নতুন টিকেট মন্তব্য',
            'body' => ':actor এই টিকেটে একটি নতুন মন্তব্য পোস্ট করেছেন।',
            'body_default' => 'একজন পরামর্শদাতা এই টিকেটে একটি নতুন মন্তব্য পোস্ট করেছেন।',
        ],
        'default' => [
            'subject' => 'টিকেট আপডেট',
            'body' => 'আপনার টিকেটে একটি আপডেট আছে।',
        ],
    ],

    // ── Order Lifecycle ─────────────────────────────────────────────
    'order_lifecycle' => [
        'order_label' => 'অর্ডার: :order_number',
        'total_label' => 'মোট: :total :currency',
        'view_order' => 'অর্ডার দেখুন',

        'created' => [
            'subject' => 'অর্ডার গৃহীত',
            'body' => 'আমরা আপনার অর্ডার পেয়েছি এবং পেমেন্টের অপেক্ষায় আছি।',
        ],
        'paid' => [
            'subject' => 'পেমেন্ট নিশ্চিত',
            'body' => 'আপনার পেমেন্ট নিশ্চিত হয়েছে এবং প্রক্রিয়াকরণ শুরু হয়েছে।',
        ],
        'failed' => [
            'subject' => 'পেমেন্ট ব্যর্থ',
            'body' => 'আপনার পেমেন্ট প্রচেষ্টা ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেকআউট করুন।',
        ],
        'cancelled' => [
            'subject' => 'অর্ডার বাতিল',
            'body' => 'আপনার অর্ডার বাতিল হয়েছে।',
        ],
        'refunded' => [
            'subject' => 'অর্ডার ফেরত',
            'body' => 'আপনার পেমেন্ট ফেরত দেওয়া হয়েছে এবং অর্ডার বন্ধ হয়েছে।',
        ],
        'default' => [
            'subject' => 'অর্ডার আপডেট',
            'body' => 'আপনার অর্ডারে একটি আপডেট আছে।',
        ],
    ],

    // ── Meeting Scheduled ───────────────────────────────────────────
    'meeting_scheduled' => [
        'subject' => 'পরামর্শ নির্ধারিত: :property_name',
        'greeting' => 'হ্যালো :name,',
        'scheduled' => '**:property_name**-এর জন্য আপনার বিনামূল্যে পরামর্শ নির্ধারিত হয়েছে!',
        'date_label' => 'তারিখ: :date',
        'time_label' => 'সময়: :time (বাংলাদেশ সময়)',
        'duration_label' => 'সময়কাল: :minutes মিনিট',
        'consultant_label' => 'পরামর্শদাতা: :consultant_name',
        'ticket_label' => 'টিকেট: :ticket_number',
        'join_meeting' => 'Google Meet-এ যোগ দিন',
        'access_note' => 'আপনার টিকেট পেজ থেকেও মিটিং লিংক পেতে পারেন।',
        'punctuality' => 'অনুগ্রহ করে সময়মতো মিটিংয়ে যোগ দিন। পুনঃনির্ধারণ করতে হলে টিকেটের মাধ্যমে যোগাযোগ করুন।',
        'alarm_30' => '৩০ মিনিটে পরামর্শ',
        'alarm_15' => '১৫ মিনিটে পরামর্শ',
    ],

    // ── Form Invitation ─────────────────────────────────────────────
    'form_invitation' => [
        'subject' => 'অনুগ্রহ করে পূরণ করুন: :template_name :ticket_number-এর জন্য',
        'greeting' => 'হ্যালো,',
        'request' => 'আপনার পরামর্শদাতা **:consultant_name** আপনার সম্পত্তি পরামর্শের জন্য একটি ফর্ম পূরণ করতে অনুরোধ করেছেন।',
        'form_label' => 'ফর্ম: :template_name',
        'ticket_label' => 'টিকেট: :ticket_number',
        'property_label' => 'সম্পত্তি: :property_name',
        'please_complete' => 'আমরা আপনাকে আরো ভালোভাবে সাহায্য করতে পারি, তাই অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব এই ফর্মটি পূরণ করুন।',
        'fill_form' => 'ফর্ম পূরণ করুন',
        'expiry_note' => 'এই লিংক ৭ দিন পর মেয়াদোত্তীর্ণ হবে। ফর্ম পূরণে লগইন প্রয়োজন নেই।',
    ],

    // ── Form Completed ──────────────────────────────────────────────
    'form_completed' => [
        'subject' => 'ফর্ম সম্পন্ন: :template_name :ticket_number-এর জন্য',
        'greeting' => 'হ্যালো :name,',
        'completed' => 'গ্রাহক (**:customer_email**) আপনার পাঠানো পরামর্শ ফর্মটি সম্পন্ন করেছেন।',
        'form_label' => 'ফর্ম: :template_name',
        'ticket_label' => 'টিকেট: :ticket_number',
        'view_responses' => 'উত্তর দেখুন',
        'review_note' => 'টিকেট বিস্তারিত পৃষ্ঠা থেকে উত্তর পর্যালোচনা করতে পারেন।',
    ],

    // ── Transactional Email Service ─────────────────────────────────
    'email' => [
        'hello' => 'হ্যালো :name,',
        'hello_generic' => 'হ্যালো,',

        'ticket_update_heading' => 'টিকেট আপডেট: :ticket_number',
        'ticket_update_subject' => 'টিকেট :ticket_number-এর আপডেট',
        'ticket_assigned_message' => 'আপনার টিকেটে একজন পরামর্শদাতা নিযুক্ত হয়েছেন।',
        'ticket_status_updated' => 'আপনার টিকেটের স্থিতি <strong>:status</strong>-এ আপডেট হয়েছে।',
        'ticket_status_updated_was' => 'আপনার টিকেটের স্থিতি <strong>:status</strong>-এ আপডেট হয়েছে (আগে ছিল: :from_status)।',
        'ticket_comment_added' => ':actor আপনার টিকেটে একটি মন্তব্য যোগ করেছেন।',
        'view_ticket' => 'টিকেট দেখুন',

        'ticket_created_heading' => 'আপনার টিকেট তৈরি হয়েছে',
        'ticket_created_body' => 'আপনার পরামর্শ অনুরোধ সফলভাবে জমা হয়েছে।',
        'ticket_created_consultant_note' => 'শীঘ্রই একজন পরামর্শদাতা নিযুক্ত হবেন। আপডেট হলে আপনি ইমেইল পাবেন।',
        'ticket_created_subject' => 'টিকেট :ticket_number :property_name-এর জন্য তৈরি হয়েছে',

        'meeting_heading' => 'পরামর্শ মিটিং নির্ধারিত',
        'meeting_body' => 'আপনার পরামর্শ মিটিং নির্ধারিত হয়েছে।',
        'meeting_no_link' => 'আপনার পরামর্শদাতা আলাদাভাবে মিটিং লিংক শেয়ার করবেন।',
        'meeting_early' => 'অনুগ্রহ করে কয়েক মিনিট আগে যোগ দিন। পুনঃনির্ধারণ করতে হলে আপনার পরামর্শদাতার সাথে যোগাযোগ করুন।',
        'meeting_subject' => ':ticket_number-এর জন্য মিটিং নির্ধারিত',
        'join_meeting' => 'মিটিংয়ে যোগ দিন',

        'booking_heading' => 'আপনার পরামর্শ শিডিউল করুন',
        'booking_body' => 'আপনার পরামর্শদাতা <strong>:consultant_name</strong> <strong>:property_name</strong> (টিকেট :ticket_number) সম্পর্কে আপনার সাথে দেখা করতে প্রস্তুত।',
        'booking_pick_time' => 'আপনার সুবিধামতো একটি সময় বেছে নিন:',
        'booking_note' => 'এটি একটি একবার ব্যবহারযোগ্য লিংক। বুক করলে মিটিং বিস্তারিত সহ নিশ্চিতকরণ পাবেন।',
        'booking_subject' => ':ticket_number-এর জন্য আপনার পরামর্শ শিডিউল করুন',
        'book_time' => 'সময় বুক করুন',

        'form_invitation_heading' => 'পরামর্শ ফর্ম অনুরোধ',
        'form_invitation_body' => 'আপনার পরামর্শদাতা <strong>:consultant_name</strong> আপনার সম্পত্তি পরামর্শের জন্য একটি ফর্ম পূরণ করতে অনুরোধ করেছেন।',
        'form_invitation_please_complete' => 'আমরা আপনাকে আরো ভালোভাবে সাহায্য করতে পারি, তাই অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব এই ফর্মটি পূরণ করুন।',
        'form_invitation_expiry' => 'এই লিংক ৭ দিন পর মেয়াদোত্তীর্ণ হবে। ফর্ম পূরণে লগইন প্রয়োজন নেই।',
        'form_invitation_subject' => 'অনুগ্রহ করে পূরণ করুন: :template_name :ticket_number-এর জন্য',
        'fill_form' => 'ফর্ম পূরণ করুন',

        'form_completed_heading' => 'গ্রাহক ফর্ম সম্পন্ন করেছেন',
        'form_completed_body' => 'গ্রাহক (:customer_email) টিকেট :ticket_number-এর জন্য <strong>:template_name</strong> ফর্মটি সম্পন্ন করেছেন।',
        'form_completed_review' => 'উত্তর পর্যালোচনা করুন এবং পরামর্শ নিয়ে এগিয়ে যান।',
        'form_completed_subject' => 'ফর্ম সম্পন্ন: :template_name :ticket_number-এর জন্য',
        'view_ticket_detail' => 'টিকেট দেখুন',

        'order_subject' => ':label: :order_number',
        'order_body' => 'আপনার অর্ডার <strong>:order_number</strong> (:currency :total) :event হয়েছে।',
        'view_order' => 'অর্ডার দেখুন',

        'label_ticket' => 'টিকেট:',
        'label_property' => 'সম্পত্তি:',
        'label_service' => 'সেবা:',
        'label_consultant' => 'পরামর্শদাতা:',
        'label_date' => 'তারিখ:',
        'label_duration' => 'সময়কাল:',
        'label_form' => 'ফর্ম:',

        'default_property' => 'আপনার সম্পত্তি',
        'default_service' => 'সম্পত্তি পরামর্শ',
        'default_consultant' => 'Wisebox পরামর্শদাতা',
    ],
];
