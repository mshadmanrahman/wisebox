<?php

namespace Database\Seeders;

use App\Models\Translation;
use Illuminate\Database\Seeder;

class TranslationSeeder extends Seeder
{
    public function run(): void
    {
        $translations = $this->allTranslations();

        foreach ($translations as $entry) {
            Translation::updateOrCreate(
                [
                    'locale' => $entry['locale'],
                    'namespace' => $entry['namespace'],
                    'key' => $entry['key'],
                ],
                [
                    'value' => $entry['value'],
                ]
            );
        }
    }

    private function allTranslations(): array
    {
        $entries = [];

        foreach ($this->namespaces() as $namespace => $keys) {
            foreach ($keys as $key => $locales) {
                foreach ($locales as $locale => $value) {
                    $entries[] = [
                        'locale' => $locale,
                        'namespace' => $namespace,
                        'key' => $key,
                        'value' => $value,
                    ];
                }
            }
        }

        return $entries;
    }

    private function namespaces(): array
    {
        return [
            'common' => $this->common(),
            'auth' => $this->auth(),
            'dashboard' => $this->dashboard(),
            'properties' => $this->properties(),
            'tickets' => $this->tickets(),
            'orders' => $this->orders(),
            'settings' => $this->settings(),
            'notifications' => $this->notifications(),
            'consultant' => $this->consultant(),
            'admin' => $this->admin(),
            'forms' => $this->forms(),
        ];
    }

    // ── common (~40 keys) ──────────────────────────────────────────

    private function common(): array
    {
        return [
            // Navigation
            'nav.home' => ['en' => 'Home', 'bn' => 'হোম'],
            'nav.dashboard' => ['en' => 'Dashboard', 'bn' => 'ড্যাশবোর্ড'],
            'nav.properties' => ['en' => 'Properties', 'bn' => 'সম্পত্তি'],
            'nav.tickets' => ['en' => 'Tickets', 'bn' => 'টিকেট'],
            'nav.orders' => ['en' => 'Orders', 'bn' => 'অর্ডার'],
            'nav.notifications' => ['en' => 'Notifications', 'bn' => 'বিজ্ঞপ্তি'],
            'nav.settings' => ['en' => 'Settings', 'bn' => 'সেটিংস'],
            'nav.logout' => ['en' => 'Logout', 'bn' => 'লগ আউট'],
            'nav.consultations' => ['en' => 'Consultations', 'bn' => 'পরামর্শ'],

            // Pagination
            'pagination.previous' => ['en' => 'Previous', 'bn' => 'পূর্ববর্তী'],
            'pagination.next' => ['en' => 'Next', 'bn' => 'পরবর্তী'],
            'pagination.showing' => ['en' => 'Showing', 'bn' => 'দেখানো হচ্ছে'],
            'pagination.of' => ['en' => 'of', 'bn' => 'এর মধ্যে'],
            'pagination.results' => ['en' => 'results', 'bn' => 'ফলাফল'],
            'pagination.page' => ['en' => 'Page', 'bn' => 'পৃষ্ঠা'],

            // Loading & states
            'loading' => ['en' => 'Loading...', 'bn' => 'লোড হচ্ছে...'],
            'saving' => ['en' => 'Saving...', 'bn' => 'সংরক্ষণ হচ্ছে...'],
            'processing' => ['en' => 'Processing...', 'bn' => 'প্রক্রিয়াকরণ হচ্ছে...'],
            'no_results' => ['en' => 'No results found', 'bn' => 'কোনো ফলাফল পাওয়া যায়নি'],
            'empty_state' => ['en' => 'Nothing here yet', 'bn' => 'এখানে এখনও কিছু নেই'],

            // Actions
            'action.save' => ['en' => 'Save', 'bn' => 'সংরক্ষণ'],
            'action.cancel' => ['en' => 'Cancel', 'bn' => 'বাতিল'],
            'action.delete' => ['en' => 'Delete', 'bn' => 'মুছুন'],
            'action.edit' => ['en' => 'Edit', 'bn' => 'সম্পাদনা'],
            'action.create' => ['en' => 'Create', 'bn' => 'তৈরি করুন'],
            'action.submit' => ['en' => 'Submit', 'bn' => 'জমা দিন'],
            'action.confirm' => ['en' => 'Confirm', 'bn' => 'নিশ্চিত করুন'],
            'action.back' => ['en' => 'Back', 'bn' => 'পিছনে'],
            'action.view' => ['en' => 'View', 'bn' => 'দেখুন'],
            'action.close' => ['en' => 'Close', 'bn' => 'বন্ধ করুন'],
            'action.search' => ['en' => 'Search', 'bn' => 'অনুসন্ধান'],
            'action.filter' => ['en' => 'Filter', 'bn' => 'ফিল্টার'],
            'action.retry' => ['en' => 'Retry', 'bn' => 'পুনরায় চেষ্টা করুন'],
            'action.upload' => ['en' => 'Upload', 'bn' => 'আপলোড'],
            'action.download' => ['en' => 'Download', 'bn' => 'ডাউনলোড'],

            // Error
            'error.generic' => ['en' => 'Something went wrong. Please try again.', 'bn' => 'কিছু একটা সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'],
            'error.network' => ['en' => 'Network error. Please check your connection.', 'bn' => 'নেটওয়ার্ক ত্রুটি। আপনার সংযোগ পরীক্ষা করুন।'],
            'error.unauthorized' => ['en' => 'You are not authorized to perform this action.', 'bn' => 'এই কাজটি করতে আপনি অনুমোদিত নন।'],
            'error.not_found' => ['en' => 'The requested resource was not found.', 'bn' => 'অনুরোধকৃত তথ্য পাওয়া যায়নি।'],

            // Footer
            'footer.copyright' => ['en' => 'Wisebox. All rights reserved.', 'bn' => 'Wisebox। সর্বস্বত্ব সংরক্ষিত।'],
            'footer.privacy' => ['en' => 'Privacy Policy', 'bn' => 'গোপনীয়তা নীতি'],
            'footer.terms' => ['en' => 'Terms of Service', 'bn' => 'সেবার শর্তাবলি'],
        ];
    }

    // ── auth (~35 keys) ────────────────────────────────────────────

    private function auth(): array
    {
        return [
            // Login
            'login.title' => ['en' => 'Welcome back', 'bn' => 'আবার স্বাগতম'],
            'login.subtitle' => ['en' => 'Sign in to your account', 'bn' => 'আপনার অ্যাকাউন্টে সাইন ইন করুন'],
            'login.email' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'login.password' => ['en' => 'Password', 'bn' => 'পাসওয়ার্ড'],
            'login.remember' => ['en' => 'Remember me', 'bn' => 'মনে রাখুন'],
            'login.submit' => ['en' => 'Sign in', 'bn' => 'সাইন ইন'],
            'login.forgot' => ['en' => 'Forgot password?', 'bn' => 'পাসওয়ার্ড ভুলে গেছেন?'],
            'login.no_account' => ['en' => "Don't have an account?", 'bn' => 'অ্যাকাউন্ট নেই?'],
            'login.register_link' => ['en' => 'Create an account', 'bn' => 'অ্যাকাউন্ট তৈরি করুন'],
            'login.or' => ['en' => 'or', 'bn' => 'অথবা'],
            'login.google' => ['en' => 'Continue with Google', 'bn' => 'Google দিয়ে চালিয়ে যান'],

            // Register
            'register.title' => ['en' => 'Create your account', 'bn' => 'আপনার অ্যাকাউন্ট তৈরি করুন'],
            'register.subtitle' => ['en' => 'Start managing your properties', 'bn' => 'আপনার সম্পত্তি পরিচালনা শুরু করুন'],
            'register.name' => ['en' => 'Full name', 'bn' => 'পুরো নাম'],
            'register.email' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'register.password' => ['en' => 'Password', 'bn' => 'পাসওয়ার্ড'],
            'register.confirm_password' => ['en' => 'Confirm password', 'bn' => 'পাসওয়ার্ড নিশ্চিত করুন'],
            'register.country' => ['en' => 'Country of residence', 'bn' => 'বসবাসের দেশ'],
            'register.terms' => ['en' => 'I agree to the Terms of Service and Privacy Policy', 'bn' => 'আমি সেবার শর্তাবলি এবং গোপনীয়তা নীতিতে সম্মত'],
            'register.submit' => ['en' => 'Create account', 'bn' => 'অ্যাকাউন্ট তৈরি করুন'],
            'register.has_account' => ['en' => 'Already have an account?', 'bn' => 'ইতিমধ্যে অ্যাকাউন্ট আছে?'],
            'register.login_link' => ['en' => 'Sign in', 'bn' => 'সাইন ইন'],

            // Forgot password
            'forgot.title' => ['en' => 'Reset your password', 'bn' => 'আপনার পাসওয়ার্ড রিসেট করুন'],
            'forgot.subtitle' => ['en' => 'Enter your email and we\'ll send you a reset link', 'bn' => 'আপনার ইমেইল লিখুন, আমরা রিসেট লিংক পাঠাব'],
            'forgot.email' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'forgot.submit' => ['en' => 'Send reset link', 'bn' => 'রিসেট লিংক পাঠান'],
            'forgot.back_to_login' => ['en' => 'Back to sign in', 'bn' => 'সাইন ইনে ফিরে যান'],
            'forgot.success' => ['en' => 'If an account exists with that email, you will receive a password reset link shortly.', 'bn' => 'যদি এই ইমেইলে কোনো অ্যাকাউন্ট থাকে, আপনি শীঘ্রই একটি পাসওয়ার্ড রিসেট লিংক পাবেন।'],

            // OTP
            'otp.title' => ['en' => 'Verify your email', 'bn' => 'আপনার ইমেইল যাচাই করুন'],
            'otp.subtitle' => ['en' => 'We sent a 6-digit code to your email', 'bn' => 'আমরা আপনার ইমেইলে একটি ৬-সংখ্যার কোড পাঠিয়েছি'],
            'otp.placeholder' => ['en' => 'Enter 6-digit code', 'bn' => '৬-সংখ্যার কোড লিখুন'],
            'otp.submit' => ['en' => 'Verify', 'bn' => 'যাচাই করুন'],
            'otp.resend' => ['en' => 'Resend code', 'bn' => 'কোড পুনরায় পাঠান'],
            'otp.resend_in' => ['en' => 'Resend in {{seconds}}s', 'bn' => '{{seconds}} সেকেন্ডে পুনরায় পাঠান'],
            'otp.channel_email' => ['en' => 'Send via email', 'bn' => 'ইমেইলে পাঠান'],
            'otp.channel_sms' => ['en' => 'Send via SMS', 'bn' => 'SMS-এ পাঠান'],
        ];
    }

    // ── dashboard (~25 keys) ───────────────────────────────────────

    private function dashboard(): array
    {
        return [
            'greeting' => ['en' => 'Welcome, {{name}}', 'bn' => 'স্বাগতম, {{name}}'],
            'subtitle' => ['en' => 'Here\'s an overview of your properties and services', 'bn' => 'আপনার সম্পত্তি এবং সেবার সারসংক্ষেপ'],

            // Stats
            'stats.properties' => ['en' => 'My Properties', 'bn' => 'আমার সম্পত্তি'],
            'stats.active_tickets' => ['en' => 'Active Tickets', 'bn' => 'সক্রিয় টিকেট'],
            'stats.orders' => ['en' => 'Orders', 'bn' => 'অর্ডার'],
            'stats.documents' => ['en' => 'Documents', 'bn' => 'দলিলপত্র'],

            // Quick actions
            'quick.add_property' => ['en' => 'Add Property', 'bn' => 'সম্পত্তি যোগ করুন'],
            'quick.free_consultation' => ['en' => 'Free Consultation', 'bn' => 'বিনামূল্যে পরামর্শ'],
            'quick.browse_services' => ['en' => 'Browse Services', 'bn' => 'সেবা দেখুন'],
            'quick.view_properties' => ['en' => 'View Properties', 'bn' => 'সম্পত্তি দেখুন'],

            // Guide cards
            'guide.step1_title' => ['en' => 'Register Your Property', 'bn' => 'আপনার সম্পত্তি নিবন্ধন করুন'],
            'guide.step1_desc' => ['en' => 'Add your property details to get started', 'bn' => 'শুরু করতে আপনার সম্পত্তির তথ্য যোগ করুন'],
            'guide.step2_title' => ['en' => 'Upload Documents', 'bn' => 'দলিলপত্র আপলোড করুন'],
            'guide.step2_desc' => ['en' => 'Upload relevant property documents for verification', 'bn' => 'যাচাইয়ের জন্য প্রাসঙ্গিক সম্পত্তি দলিল আপলোড করুন'],
            'guide.step3_title' => ['en' => 'Get Assessment', 'bn' => 'মূল্যায়ন পান'],
            'guide.step3_desc' => ['en' => 'Receive a free property assessment report', 'bn' => 'বিনামূল্যে সম্পত্তি মূল্যায়ন রিপোর্ট পান'],
            'guide.step4_title' => ['en' => 'Consult an Expert', 'bn' => 'বিশেষজ্ঞের পরামর্শ নিন'],
            'guide.step4_desc' => ['en' => 'Book a free consultation with a property expert', 'bn' => 'সম্পত্তি বিশেষজ্ঞের সাথে বিনামূল্যে পরামর্শ বুক করুন'],

            // CTA
            'cta.assessment_title' => ['en' => 'Free Property Assessment', 'bn' => 'বিনামূল্যে সম্পত্তি মূল্যায়ন'],
            'cta.assessment_desc' => ['en' => 'Get a comprehensive assessment of your property\'s legal status and documentation', 'bn' => 'আপনার সম্পত্তির আইনি অবস্থা এবং দলিলপত্রের একটি সম্পূর্ণ মূল্যায়ন পান'],
            'cta.assessment_button' => ['en' => 'Start Assessment', 'bn' => 'মূল্যায়ন শুরু করুন'],

            // Recent activity
            'recent.title' => ['en' => 'Recent Activity', 'bn' => 'সাম্প্রতিক কার্যকলাপ'],
            'recent.no_activity' => ['en' => 'No recent activity', 'bn' => 'কোনো সাম্প্রতিক কার্যকলাপ নেই'],
        ];
    }

    // ── properties (~45 keys) ──────────────────────────────────────

    private function properties(): array
    {
        return [
            // List
            'list.title' => ['en' => 'My Properties', 'bn' => 'আমার সম্পত্তি'],
            'list.add' => ['en' => 'Add Property', 'bn' => 'সম্পত্তি যোগ করুন'],
            'list.empty' => ['en' => 'You haven\'t added any properties yet', 'bn' => 'আপনি এখনও কোনো সম্পত্তি যোগ করেননি'],
            'list.empty_cta' => ['en' => 'Add your first property to get started', 'bn' => 'শুরু করতে আপনার প্রথম সম্পত্তি যোগ করুন'],
            'list.completion' => ['en' => '{{percent}}% complete', 'bn' => '{{percent}}% সম্পূর্ণ'],

            // Detail
            'detail.title' => ['en' => 'Property Details', 'bn' => 'সম্পত্তির বিস্তারিত'],
            'detail.status' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'detail.type' => ['en' => 'Property Type', 'bn' => 'সম্পত্তির ধরন'],
            'detail.ownership' => ['en' => 'Ownership Status', 'bn' => 'মালিকানার স্থিতি'],
            'detail.ownership_type' => ['en' => 'Ownership Type', 'bn' => 'মালিকানার ধরন'],
            'detail.location' => ['en' => 'Location', 'bn' => 'অবস্থান'],
            'detail.size' => ['en' => 'Size', 'bn' => 'আয়তন'],
            'detail.description' => ['en' => 'Description', 'bn' => 'বিবরণ'],
            'detail.created' => ['en' => 'Created', 'bn' => 'তৈরির তারিখ'],

            // Create/Edit form
            'form.title_create' => ['en' => 'Add New Property', 'bn' => 'নতুন সম্পত্তি যোগ করুন'],
            'form.title_edit' => ['en' => 'Edit Property', 'bn' => 'সম্পত্তি সম্পাদনা করুন'],
            'form.name' => ['en' => 'Property Name', 'bn' => 'সম্পত্তির নাম'],
            'form.name_placeholder' => ['en' => 'e.g., Family home in Dhaka', 'bn' => 'যেমন, ঢাকায় পারিবারিক বাড়ি'],
            'form.type' => ['en' => 'Property Type', 'bn' => 'সম্পত্তির ধরন'],
            'form.ownership_status' => ['en' => 'Ownership Status', 'bn' => 'মালিকানার স্থিতি'],
            'form.ownership_type' => ['en' => 'Ownership Type', 'bn' => 'মালিকানার ধরন'],
            'form.division' => ['en' => 'Division', 'bn' => 'বিভাগ'],
            'form.district' => ['en' => 'District', 'bn' => 'জেলা'],
            'form.upazila' => ['en' => 'Upazila/Thana', 'bn' => 'উপজেলা/থানা'],
            'form.mouza' => ['en' => 'Mouza', 'bn' => 'মৌজা'],
            'form.address' => ['en' => 'Address', 'bn' => 'ঠিকানা'],
            'form.size' => ['en' => 'Size', 'bn' => 'আয়তন'],
            'form.size_unit' => ['en' => 'Unit', 'bn' => 'একক'],
            'form.description' => ['en' => 'Description (optional)', 'bn' => 'বিবরণ (ঐচ্ছিক)'],
            'form.saving_draft' => ['en' => 'Saving draft...', 'bn' => 'খসড়া সংরক্ষণ হচ্ছে...'],
            'form.draft_saved' => ['en' => 'Draft saved', 'bn' => 'খসড়া সংরক্ষিত'],

            // Documents tab
            'docs.title' => ['en' => 'Documents', 'bn' => 'দলিলপত্র'],
            'docs.upload' => ['en' => 'Upload Document', 'bn' => 'দলিল আপলোড করুন'],
            'docs.uploaded' => ['en' => 'Uploaded', 'bn' => 'আপলোড করা হয়েছে'],
            'docs.missing' => ['en' => 'Missing', 'bn' => 'অনুপস্থিত'],
            'docs.pending' => ['en' => 'Pending', 'bn' => 'মুলতুবি'],
            'docs.mark_missing' => ['en' => "I don't have this document", 'bn' => 'আমার কাছে এই দলিল নেই'],
            'docs.required' => ['en' => 'Required', 'bn' => 'প্রয়োজনীয়'],
            'docs.optional' => ['en' => 'Optional', 'bn' => 'ঐচ্ছিক'],

            // Co-owners tab
            'coowners.title' => ['en' => 'Co-Owners', 'bn' => 'সহ-মালিক'],
            'coowners.add' => ['en' => 'Add Co-Owner', 'bn' => 'সহ-মালিক যোগ করুন'],
            'coowners.name' => ['en' => 'Name', 'bn' => 'নাম'],
            'coowners.relationship' => ['en' => 'Relationship', 'bn' => 'সম্পর্ক'],
            'coowners.percentage' => ['en' => 'Ownership %', 'bn' => 'মালিকানা %'],
            'coowners.phone' => ['en' => 'Phone', 'bn' => 'ফোন'],
            'coowners.email' => ['en' => 'Email', 'bn' => 'ইমেইল'],
        ];
    }

    // ── tickets (~30 keys) ─────────────────────────────────────────

    private function tickets(): array
    {
        return [
            'list.title' => ['en' => 'My Tickets', 'bn' => 'আমার টিকেট'],
            'list.empty' => ['en' => 'No tickets yet', 'bn' => 'এখনও কোনো টিকেট নেই'],
            'list.create' => ['en' => 'Create Ticket', 'bn' => 'টিকেট তৈরি করুন'],

            'detail.title' => ['en' => 'Ticket Details', 'bn' => 'টিকেটের বিস্তারিত'],
            'detail.ticket_number' => ['en' => 'Ticket #', 'bn' => 'টিকেট #'],
            'detail.property' => ['en' => 'Property', 'bn' => 'সম্পত্তি'],
            'detail.service' => ['en' => 'Service', 'bn' => 'সেবা'],
            'detail.priority' => ['en' => 'Priority', 'bn' => 'অগ্রাধিকার'],
            'detail.status' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'detail.consultant' => ['en' => 'Consultant', 'bn' => 'পরামর্শদাতা'],
            'detail.created' => ['en' => 'Created', 'bn' => 'তৈরি'],
            'detail.meeting' => ['en' => 'Meeting', 'bn' => 'মিটিং'],
            'detail.meeting_join' => ['en' => 'Join Meeting', 'bn' => 'মিটিংয়ে যোগ দিন'],

            // Comments
            'comments.title' => ['en' => 'Comments', 'bn' => 'মন্তব্য'],
            'comments.add' => ['en' => 'Add Comment', 'bn' => 'মন্তব্য যোগ করুন'],
            'comments.placeholder' => ['en' => 'Write a comment...', 'bn' => 'একটি মন্তব্য লিখুন...'],
            'comments.submit' => ['en' => 'Send', 'bn' => 'পাঠান'],
            'comments.internal' => ['en' => 'Internal note', 'bn' => 'অভ্যন্তরীণ নোট'],
            'comments.attachment' => ['en' => 'Attach files', 'bn' => 'ফাইল সংযুক্ত করুন'],

            // Status badges
            'status.open' => ['en' => 'Open', 'bn' => 'খোলা'],
            'status.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'status.in_progress' => ['en' => 'In Progress', 'bn' => 'চলমান'],
            'status.awaiting_customer' => ['en' => 'Awaiting Your Response', 'bn' => 'আপনার উত্তরের অপেক্ষায়'],
            'status.awaiting_consultant' => ['en' => 'Awaiting Consultant', 'bn' => 'পরামর্শদাতার অপেক্ষায়'],
            'status.scheduled' => ['en' => 'Scheduled', 'bn' => 'নির্ধারিত'],
            'status.completed' => ['en' => 'Completed', 'bn' => 'সম্পন্ন'],
            'status.cancelled' => ['en' => 'Cancelled', 'bn' => 'বাতিল'],

            // Priority
            'priority.low' => ['en' => 'Low', 'bn' => 'নিম্ন'],
            'priority.medium' => ['en' => 'Medium', 'bn' => 'মধ্যম'],
            'priority.high' => ['en' => 'High', 'bn' => 'উচ্চ'],
            'priority.urgent' => ['en' => 'Urgent', 'bn' => 'জরুরি'],
        ];
    }

    // ── orders (~20 keys) ──────────────────────────────────────────

    private function orders(): array
    {
        return [
            'list.title' => ['en' => 'My Orders', 'bn' => 'আমার অর্ডার'],
            'list.empty' => ['en' => 'No orders yet', 'bn' => 'এখনও কোনো অর্ডার নেই'],
            'list.browse' => ['en' => 'Browse Services', 'bn' => 'সেবা দেখুন'],

            'detail.title' => ['en' => 'Order Details', 'bn' => 'অর্ডারের বিস্তারিত'],
            'detail.order_number' => ['en' => 'Order #', 'bn' => 'অর্ডার #'],
            'detail.date' => ['en' => 'Date', 'bn' => 'তারিখ'],
            'detail.status' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'detail.total' => ['en' => 'Total', 'bn' => 'মোট'],
            'detail.subtotal' => ['en' => 'Subtotal', 'bn' => 'উপমোট'],
            'detail.items' => ['en' => 'Items', 'bn' => 'আইটেম'],

            // Payment status
            'payment.pending' => ['en' => 'Pending Payment', 'bn' => 'পেমেন্ট মুলতুবি'],
            'payment.paid' => ['en' => 'Paid', 'bn' => 'পরিশোধিত'],
            'payment.failed' => ['en' => 'Payment Failed', 'bn' => 'পেমেন্ট ব্যর্থ'],
            'payment.refunded' => ['en' => 'Refunded', 'bn' => 'ফেরত দেওয়া হয়েছে'],

            // Actions
            'action.checkout' => ['en' => 'Proceed to Payment', 'bn' => 'পেমেন্টে যান'],
            'action.cancel' => ['en' => 'Cancel Order', 'bn' => 'অর্ডার বাতিল করুন'],
            'action.cancel_confirm' => ['en' => 'Are you sure you want to cancel this order?', 'bn' => 'আপনি কি নিশ্চিত যে এই অর্ডার বাতিল করতে চান?'],

            // Checkout
            'checkout.title' => ['en' => 'Checkout', 'bn' => 'চেকআউট'],
            'checkout.time_slots' => ['en' => 'Preferred Time Slots', 'bn' => 'পছন্দের সময়'],
            'checkout.time_slots_desc' => ['en' => 'Select at least 2 preferred time slots for your consultation', 'bn' => 'আপনার পরামর্শের জন্য কমপক্ষে ২টি পছন্দের সময় বেছে নিন'],
        ];
    }

    // ── settings (~30 keys) ────────────────────────────────────────

    private function settings(): array
    {
        return [
            'title' => ['en' => 'Settings', 'bn' => 'সেটিংস'],

            // Tabs
            'tab.profile' => ['en' => 'Profile', 'bn' => 'প্রোফাইল'],
            'tab.password' => ['en' => 'Password', 'bn' => 'পাসওয়ার্ড'],
            'tab.notifications' => ['en' => 'Notifications', 'bn' => 'বিজ্ঞপ্তি'],
            'tab.preferences' => ['en' => 'Preferences', 'bn' => 'পছন্দসমূহ'],

            // Profile form
            'profile.name' => ['en' => 'Full Name', 'bn' => 'পুরো নাম'],
            'profile.email' => ['en' => 'Email', 'bn' => 'ইমেইল'],
            'profile.phone' => ['en' => 'Phone', 'bn' => 'ফোন'],
            'profile.dob' => ['en' => 'Date of Birth', 'bn' => 'জন্ম তারিখ'],
            'profile.nationality' => ['en' => 'Nationality', 'bn' => 'জাতীয়তা'],
            'profile.nid' => ['en' => 'NID Number', 'bn' => 'জাতীয় পরিচয়পত্র নম্বর'],
            'profile.passport' => ['en' => 'Passport Number', 'bn' => 'পাসপোর্ট নম্বর'],
            'profile.address' => ['en' => 'Address', 'bn' => 'ঠিকানা'],
            'profile.city' => ['en' => 'City', 'bn' => 'শহর'],
            'profile.state' => ['en' => 'State/Division', 'bn' => 'রাজ্য/বিভাগ'],
            'profile.postal' => ['en' => 'Postal Code', 'bn' => 'পোস্টাল কোড'],
            'profile.country' => ['en' => 'Country', 'bn' => 'দেশ'],
            'profile.saved' => ['en' => 'Profile updated successfully', 'bn' => 'প্রোফাইল সফলভাবে আপডেট হয়েছে'],

            // Password
            'password.current' => ['en' => 'Current Password', 'bn' => 'বর্তমান পাসওয়ার্ড'],
            'password.new' => ['en' => 'New Password', 'bn' => 'নতুন পাসওয়ার্ড'],
            'password.confirm' => ['en' => 'Confirm New Password', 'bn' => 'নতুন পাসওয়ার্ড নিশ্চিত করুন'],
            'password.submit' => ['en' => 'Update Password', 'bn' => 'পাসওয়ার্ড আপডেট করুন'],
            'password.changed' => ['en' => 'Password changed successfully', 'bn' => 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে'],

            // Preferences
            'pref.language' => ['en' => 'Language', 'bn' => 'ভাষা'],
            'pref.language_en' => ['en' => 'English', 'bn' => 'ইংরেজি'],
            'pref.language_bn' => ['en' => 'Bangla (বাংলা)', 'bn' => 'বাংলা'],
            'pref.timezone' => ['en' => 'Timezone', 'bn' => 'সময় অঞ্চল'],

            // Notification preferences
            'notif.order_updates' => ['en' => 'Order updates', 'bn' => 'অর্ডার আপডেট'],
            'notif.ticket_updates' => ['en' => 'Ticket updates', 'bn' => 'টিকেট আপডেট'],
            'notif.consultant_updates' => ['en' => 'Consultant updates', 'bn' => 'পরামর্শদাতা আপডেট'],
            'notif.marketing_updates' => ['en' => 'Marketing & promotions', 'bn' => 'মার্কেটিং ও প্রচার'],
            'notif.saved' => ['en' => 'Notification preferences saved', 'bn' => 'বিজ্ঞপ্তি পছন্দ সংরক্ষিত'],
        ];
    }

    // ── notifications (~10 keys) ───────────────────────────────────

    private function notifications(): array
    {
        return [
            'title' => ['en' => 'Notifications', 'bn' => 'বিজ্ঞপ্তি'],
            'mark_all_read' => ['en' => 'Mark all as read', 'bn' => 'সব পঠিত হিসেবে চিহ্নিত করুন'],
            'empty' => ['en' => 'No notifications', 'bn' => 'কোনো বিজ্ঞপ্তি নেই'],
            'empty_desc' => ['en' => 'You\'re all caught up!', 'bn' => 'সব দেখা হয়ে গেছে!'],
            'filter.all' => ['en' => 'All', 'bn' => 'সব'],
            'filter.unread' => ['en' => 'Unread', 'bn' => 'অপঠিত'],
            'filter.read' => ['en' => 'Read', 'bn' => 'পঠিত'],
            'time.just_now' => ['en' => 'Just now', 'bn' => 'এইমাত্র'],
            'time.minutes_ago' => ['en' => '{{count}} min ago', 'bn' => '{{count}} মিনিট আগে'],
            'time.hours_ago' => ['en' => '{{count}}h ago', 'bn' => '{{count}} ঘণ্টা আগে'],
            'time.days_ago' => ['en' => '{{count}}d ago', 'bn' => '{{count}} দিন আগে'],
        ];
    }

    // ── consultant (~25 keys) ──────────────────────────────────────

    private function consultant(): array
    {
        return [
            'dashboard.title' => ['en' => 'Consultant Dashboard', 'bn' => 'পরামর্শদাতা ড্যাশবোর্ড'],
            'dashboard.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'dashboard.scheduled' => ['en' => 'Scheduled', 'bn' => 'নির্ধারিত'],
            'dashboard.completed_month' => ['en' => 'Completed This Month', 'bn' => 'এই মাসে সম্পন্ন'],
            'dashboard.pending_action' => ['en' => 'Pending Action', 'bn' => 'কর্ম মুলতুবি'],
            'dashboard.upcoming' => ['en' => 'Upcoming Meetings', 'bn' => 'আসন্ন মিটিং'],

            'tickets.title' => ['en' => 'My Cases', 'bn' => 'আমার মামলাসমূহ'],
            'tickets.empty' => ['en' => 'No cases assigned yet', 'bn' => 'এখনও কোনো মামলা নিযুক্ত হয়নি'],
            'tickets.filter_status' => ['en' => 'Filter by status', 'bn' => 'স্থিতি অনুযায়ী ফিল্টার'],

            'detail.customer' => ['en' => 'Customer', 'bn' => 'গ্রাহক'],
            'detail.property_info' => ['en' => 'Property Information', 'bn' => 'সম্পত্তির তথ্য'],
            'detail.documents' => ['en' => 'Documents', 'bn' => 'দলিলপত্র'],
            'detail.assessment' => ['en' => 'Assessment', 'bn' => 'মূল্যায়ন'],
            'detail.update_status' => ['en' => 'Update Status', 'bn' => 'স্থিতি আপডেট করুন'],

            'action.confirm_slot' => ['en' => 'Confirm Time Slot', 'bn' => 'সময় নিশ্চিত করুন'],
            'action.send_booking' => ['en' => 'Send Booking Link', 'bn' => 'বুকিং লিংক পাঠান'],
            'action.send_form' => ['en' => 'Send Form', 'bn' => 'ফর্ম পাঠান'],
            'action.complete' => ['en' => 'Mark Complete', 'bn' => 'সম্পন্ন চিহ্নিত করুন'],

            'form.resolution_notes' => ['en' => 'Resolution Notes', 'bn' => 'সমাধানের নোট'],
            'form.consultation_notes' => ['en' => 'Consultation Notes', 'bn' => 'পরামর্শ নোট'],
            'form.meeting_url' => ['en' => 'Meeting URL', 'bn' => 'মিটিং URL'],
            'form.meeting_date' => ['en' => 'Meeting Date', 'bn' => 'মিটিংয়ের তারিখ'],
            'form.meeting_duration' => ['en' => 'Duration (minutes)', 'bn' => 'সময়কাল (মিনিট)'],

            'metrics.title' => ['en' => 'Performance Metrics', 'bn' => 'কর্মদক্ষতা পরিমাপ'],
            'metrics.resolution_time' => ['en' => 'Avg. Resolution Time', 'bn' => 'গড় সমাধান সময়'],
            'metrics.utilization' => ['en' => 'Utilization', 'bn' => 'ব্যবহার হার'],
        ];
    }

    // ── admin (~25 keys) ───────────────────────────────────────────

    private function admin(): array
    {
        return [
            'dashboard.title' => ['en' => 'Admin Dashboard', 'bn' => 'অ্যাডমিন ড্যাশবোর্ড'],
            'dashboard.total_users' => ['en' => 'Total Users', 'bn' => 'মোট ব্যবহারকারী'],
            'dashboard.total_properties' => ['en' => 'Total Properties', 'bn' => 'মোট সম্পত্তি'],
            'dashboard.active_tickets' => ['en' => 'Active Tickets', 'bn' => 'সক্রিয় টিকেট'],
            'dashboard.revenue' => ['en' => 'Revenue', 'bn' => 'আয়'],

            'consultations.title' => ['en' => 'Consultation Requests', 'bn' => 'পরামর্শ অনুরোধ'],
            'consultations.pending' => ['en' => 'Pending', 'bn' => 'মুলতুবি'],
            'consultations.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'consultations.scheduled' => ['en' => 'Scheduled', 'bn' => 'নির্ধারিত'],
            'consultations.completed' => ['en' => 'Completed', 'bn' => 'সম্পন্ন'],
            'consultations.rejected' => ['en' => 'Rejected', 'bn' => 'প্রত্যাখ্যাত'],

            'consultations.approve' => ['en' => 'Approve', 'bn' => 'অনুমোদন করুন'],
            'consultations.reject' => ['en' => 'Reject', 'bn' => 'প্রত্যাখ্যান করুন'],
            'consultations.assign_consultant' => ['en' => 'Assign Consultant', 'bn' => 'পরামর্শদাতা নিযুক্ত করুন'],
            'consultations.reject_reason' => ['en' => 'Reason for rejection', 'bn' => 'প্রত্যাখ্যানের কারণ'],
            'consultations.admin_notes' => ['en' => 'Admin Notes', 'bn' => 'অ্যাডমিন নোট'],

            'translations.title' => ['en' => 'Translation Management', 'bn' => 'অনুবাদ ব্যবস্থাপনা'],
            'translations.namespace' => ['en' => 'Namespace', 'bn' => 'নেমস্পেস'],
            'translations.key' => ['en' => 'Key', 'bn' => 'কী'],
            'translations.english' => ['en' => 'English', 'bn' => 'ইংরেজি'],
            'translations.bangla' => ['en' => 'Bangla', 'bn' => 'বাংলা'],
            'translations.last_updated' => ['en' => 'Last Updated', 'bn' => 'সর্বশেষ আপডেট'],
            'translations.save' => ['en' => 'Save', 'bn' => 'সংরক্ষণ'],
            'translations.add_new' => ['en' => 'Add Translation', 'bn' => 'অনুবাদ যোগ করুন'],
            'translations.search' => ['en' => 'Search translations...', 'bn' => 'অনুবাদ অনুসন্ধান করুন...'],

            'learning.title' => ['en' => 'Learning Management', 'bn' => 'শিক্ষা ব্যবস্থাপনা'],
        ];
    }

    // ── forms (~15 keys) ───────────────────────────────────────────

    private function forms(): array
    {
        return [
            'title' => ['en' => 'Consultation Form', 'bn' => 'পরামর্শ ফর্ম'],
            'subtitle' => ['en' => 'Please complete the following form', 'bn' => 'অনুগ্রহ করে নিচের ফর্মটি পূরণ করুন'],
            'submit' => ['en' => 'Submit Form', 'bn' => 'ফর্ম জমা দিন'],
            'submitted' => ['en' => 'Form submitted successfully', 'bn' => 'ফর্ম সফলভাবে জমা হয়েছে'],
            'submitted_desc' => ['en' => 'Your consultant will review your responses', 'bn' => 'আপনার পরামর্শদাতা আপনার উত্তর পর্যালোচনা করবেন'],
            'expired' => ['en' => 'This form link has expired', 'bn' => 'এই ফর্ম লিংকের মেয়াদ শেষ হয়ে গেছে'],
            'expired_desc' => ['en' => 'Please contact your consultant for a new link', 'bn' => 'নতুন লিংকের জন্য আপনার পরামর্শদাতার সাথে যোগাযোগ করুন'],
            'not_found' => ['en' => 'Form not found', 'bn' => 'ফর্ম পাওয়া যায়নি'],

            // Validation
            'validation.required' => ['en' => 'This field is required', 'bn' => 'এই ক্ষেত্রটি আবশ্যক'],
            'validation.email' => ['en' => 'Please enter a valid email address', 'bn' => 'একটি বৈধ ইমেইল ঠিকানা দিন'],
            'validation.min' => ['en' => 'Must be at least {{min}} characters', 'bn' => 'অন্তত {{min}} অক্ষর হতে হবে'],
            'validation.max' => ['en' => 'Must be at most {{max}} characters', 'bn' => 'সর্বাধিক {{max}} অক্ষর হতে পারবে'],
            'validation.file_size' => ['en' => 'File size must be less than {{size}}MB', 'bn' => 'ফাইলের আকার {{size}}MB-এর কম হতে হবে'],
            'validation.file_type' => ['en' => 'Accepted formats: {{types}}', 'bn' => 'গ্রহণযোগ্য ফরম্যাট: {{types}}'],

            // Actions
            'action.next' => ['en' => 'Next', 'bn' => 'পরবর্তী'],
            'action.previous' => ['en' => 'Previous', 'bn' => 'পূর্ববর্তী'],
        ];
    }
}
