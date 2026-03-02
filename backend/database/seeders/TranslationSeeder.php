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

    // ── common ────────────────────────────────────────────────────

    private function common(): array
    {
        return [
            // Portal navigation (layout.tsx)
            'nav.assets' => ['en' => 'My Assets', 'bn' => 'আমার সম্পত্তি'],
            'nav.learning' => ['en' => 'Learning', 'bn' => 'শিক্ষা'],
            'nav.assessment' => ['en' => 'Assessment', 'bn' => 'মূল্যায়ন'],
            'nav.services' => ['en' => 'Services', 'bn' => 'সেবা'],
            'nav.tickets' => ['en' => 'Tickets', 'bn' => 'টিকেট'],
            'nav.settings' => ['en' => 'Settings', 'bn' => 'সেটিংস'],
            'nav.myCases' => ['en' => 'My Cases', 'bn' => 'আমার কেসগুলো'],
            'nav.allTickets' => ['en' => 'All Tickets', 'bn' => 'সব টিকেট'],
            'nav.adminPanel' => ['en' => 'Admin Panel', 'bn' => 'অ্যাডমিন প্যানেল'],

            // Header
            'header.notifications' => ['en' => 'Notifications', 'bn' => 'বিজ্ঞপ্তি'],
            'header.markAllRead' => ['en' => 'Mark all as read', 'bn' => 'সব পঠিত করুন'],
            'header.noNotificationsYet' => ['en' => 'No notifications yet', 'bn' => 'এখনও কোনো বিজ্ঞপ্তি নেই'],
            'header.openNotificationCenter' => ['en' => 'Open notification center', 'bn' => 'বিজ্ঞপ্তি কেন্দ্র খুলুন'],
            'header.logout' => ['en' => 'Logout', 'bn' => 'লগ আউট'],

            // Loading & states
            'loading' => ['en' => 'Loading...', 'bn' => 'লোড হচ্ছে...'],
            'tryAgain' => ['en' => 'Try again', 'bn' => 'আবার চেষ্টা করুন'],
            'retrying' => ['en' => 'Retrying...', 'bn' => 'পুনরায় চেষ্টা হচ্ছে...'],
            'retry' => ['en' => 'Retry', 'bn' => 'পুনরায় চেষ্টা'],
            'showingStaleData' => ['en' => 'Showing cached data.', 'bn' => 'ক্যাশ করা তথ্য দেখানো হচ্ছে।'],
            'letsGetStarted' => ['en' => "Let's get started", 'bn' => 'শুরু করা যাক'],
            'viewAll' => ['en' => 'View All', 'bn' => 'সব দেখুন'],
            'previous' => ['en' => 'Previous', 'bn' => 'পূর্ববর্তী'],
            'next' => ['en' => 'Next', 'bn' => 'পরবর্তী'],
            'page' => ['en' => 'Page {{current}} of {{total}}', 'bn' => 'পৃষ্ঠা {{current}} / {{total}}'],
            'copyright' => ['en' => 'Wisebox. All rights reserved.', 'bn' => 'Wisebox। সর্বস্বত্ব সংরক্ষিত।'],

            // Learning Center (learning/page.tsx)
            'learning.title' => ['en' => 'Learning Center', 'bn' => 'শিক্ষা কেন্দ্র'],
            'learning.subtitle' => ['en' => 'Everything you need to know about property management in Bangladesh', 'bn' => 'বাংলাদেশে সম্পত্তি ব্যবস্থাপনা সম্পর্কে যা জানা দরকার'],
            'learning.searchPlaceholder' => ['en' => 'Search articles...', 'bn' => 'নিবন্ধ খুঁজুন...'],
            'learning.all' => ['en' => 'All', 'bn' => 'সব'],
            'learning.noArticles' => ['en' => 'No articles found', 'bn' => 'কোনো নিবন্ধ পাওয়া যায়নি'],
            'learning.noArticlesFor' => ['en' => 'No articles found for "{{query}}"', 'bn' => '"{{query}}" এর জন্য কোনো নিবন্ধ পাওয়া যায়নি'],
            'learning.minRead' => ['en' => '{{minutes}} min read', 'bn' => '{{minutes}} মিনিট পড়ুন'],
            'learning.readArticle' => ['en' => 'Read Article', 'bn' => 'নিবন্ধ পড়ুন'],
            'learning.notSureWhereToStart' => ['en' => 'Not sure where to start?', 'bn' => 'কোথা থেকে শুরু করবেন?'],
            'learning.takeAssessment' => ['en' => 'Take a free assessment', 'bn' => 'বিনামূল্যে মূল্যায়ন নিন'],
            'learning.takeFreeAssessment' => ['en' => 'Take Free Assessment', 'bn' => 'বিনামূল্যে মূল্যায়ন নিন'],
            'learning.browseServices' => ['en' => 'Browse Services', 'bn' => 'সেবা দেখুন'],
            'learning.backToLearning' => ['en' => 'Back to Learning Center', 'bn' => 'শিক্ষা কেন্দ্রে ফিরুন'],
            'learning.articleNotFound' => ['en' => 'Article not found', 'bn' => 'নিবন্ধ পাওয়া যায়নি'],
            'learning.articleNotFoundDescription' => ['en' => 'The article you are looking for does not exist.', 'bn' => 'আপনি যে নিবন্ধটি খুঁজছেন তা বিদ্যমান নেই।'],
            'learning.browseAllArticles' => ['en' => 'Browse All Articles', 'bn' => 'সব নিবন্ধ দেখুন'],
            'learning.needHelp' => ['en' => 'Need personalized help?', 'bn' => 'ব্যক্তিগত সহায়তা দরকার?'],
            'learning.needHelpDescription' => ['en' => 'Our property experts can guide you through the process.', 'bn' => 'আমাদের সম্পত্তি বিশেষজ্ঞরা আপনাকে গাইড করতে পারেন।'],
            'learning.bookFreeConsultation' => ['en' => 'Book Free Consultation', 'bn' => 'বিনামূল্যে পরামর্শ বুক করুন'],
            'learning.moreIn' => ['en' => 'More in {{category}}', 'bn' => '{{category}} এ আরো'],
            'learning.min' => ['en' => '{{count}} min', 'bn' => '{{count}} মিনিট'],

            // Services (workspace/services/page.tsx)
            'services.title' => ['en' => 'Services', 'bn' => 'সেবা'],
            'services.subtitle' => ['en' => 'Professional property services for Bangladeshi diaspora', 'bn' => 'বাংলাদেশি প্রবাসীদের জন্য পেশাদার সম্পত্তি সেবা'],
            'services.freeConsultation.badge' => ['en' => 'Free', 'bn' => 'বিনামূল্যে'],
            'services.freeConsultation.title' => ['en' => 'Free Property Consultation', 'bn' => 'বিনামূল্যে সম্পত্তি পরামর্শ'],
            'services.freeConsultation.description' => ['en' => 'Talk to our property experts about your property needs', 'bn' => 'আপনার সম্পত্তি প্রয়োজনে আমাদের বিশেষজ্ঞদের সাথে কথা বলুন'],
            'services.freeConsultation.duration' => ['en' => '30 minute session', 'bn' => '৩০ মিনিট সেশন'],
            'services.freeConsultation.noPayment' => ['en' => 'No payment required', 'bn' => 'পেমেন্ট প্রয়োজন নেই'],
            'services.freeConsultation.selectProperty' => ['en' => 'Select a property', 'bn' => 'একটি সম্পত্তি নির্বাচন করুন'],
            'services.freeConsultation.addPropertyFirst' => ['en' => 'Add a property first', 'bn' => 'প্রথমে একটি সম্পত্তি যোগ করুন'],
            'services.freeConsultation.chooseProperty' => ['en' => 'Choose property', 'bn' => 'সম্পত্তি নির্বাচন করুন'],
            'services.freeConsultation.bookFree' => ['en' => 'Book Free Consultation', 'bn' => 'বিনামূল্যে পরামর্শ বুক করুন'],
            'services.freeConsultation.addPropertyBtn' => ['en' => 'Add Property', 'bn' => 'সম্পত্তি যোগ করুন'],
            'services.freeConsultation.selectPropertyAbove' => ['en' => 'Select a property above to continue', 'bn' => 'চালিয়ে যেতে উপরে একটি সম্পত্তি নির্বাচন করুন'],
            'services.loadingServices' => ['en' => 'Loading services...', 'bn' => 'সেবা লোড হচ্ছে...'],
            'services.noServicesInCategory' => ['en' => 'No services in this category', 'bn' => 'এই বিভাগে কোনো সেবা নেই'],
            'services.viewDetails' => ['en' => 'View Details', 'bn' => 'বিস্তারিত দেখুন'],
            'services.free' => ['en' => 'Free', 'bn' => 'বিনামূল্যে'],
            'services.requestQuote' => ['en' => 'Request Quote', 'bn' => 'মূল্য জানুন'],

            // Service detail panel
            'services.detail.selectPropertyFirst' => ['en' => 'Select a property first', 'bn' => 'প্রথমে একটি সম্পত্তি নির্বাচন করুন'],
            'services.detail.selectAtLeast2SlotsError' => ['en' => 'Please select at least 2 time slots', 'bn' => 'অনুগ্রহ করে কমপক্ষে ২টি সময় নির্বাচন করুন'],
            'services.detail.couldNotCreate' => ['en' => 'Could not create order', 'bn' => 'অর্ডার তৈরি করা যায়নি'],
            'services.detail.bookNow' => ['en' => 'Book Now', 'bn' => 'এখনই বুক করুন'],
            'services.detail.bookAndPay' => ['en' => 'Book & Pay', 'bn' => 'বুক করুন এবং পেমেন্ট করুন'],
            'services.detail.buyNow' => ['en' => 'Buy Now', 'bn' => 'এখনই কিনুন'],
            'services.detail.estimatedDuration' => ['en' => 'Estimated {{minutes}} minutes', 'bn' => 'আনুমানিক {{minutes}} মিনিট'],
            'services.detail.aboutService' => ['en' => 'About this service', 'bn' => 'এই সেবা সম্পর্কে'],
            'services.detail.noDescription' => ['en' => 'No description available', 'bn' => 'কোনো বিবরণ নেই'],
            'services.detail.category' => ['en' => 'Category', 'bn' => 'বিভাগ'],
            'services.detail.selectProperty' => ['en' => 'Select property', 'bn' => 'সম্পত্তি নির্বাচন করুন'],
            'services.detail.chooseProperty' => ['en' => 'Choose a property', 'bn' => 'একটি সম্পত্তি বেছে নিন'],
            'services.detail.describeNeeds' => ['en' => 'Describe your needs', 'bn' => 'আপনার প্রয়োজন বর্ণনা করুন'],
            'services.detail.descriptionPlaceholder' => ['en' => 'Tell us about your situation...', 'bn' => 'আপনার পরিস্থিতি সম্পর্কে বলুন...'],
            'services.detail.chooseTimeSlots' => ['en' => 'Choose preferred time slots', 'bn' => 'পছন্দের সময় নির্বাচন করুন'],
            'services.detail.timeSlotsHelp' => ['en' => 'Select at least 2 time slots that work for you', 'bn' => 'আপনার জন্য সুবিধাজনক কমপক্ষে ২টি সময় নির্বাচন করুন'],
            'services.detail.processing' => ['en' => 'Processing...', 'bn' => 'প্রক্রিয়াকরণ হচ্ছে...'],
            'services.detail.selectAtLeast2Slots' => ['en' => 'Select at least 2 slots', 'bn' => 'কমপক্ষে ২টি সময় নির্বাচন করুন'],
            'services.detail.yourProperties' => ['en' => 'Your properties', 'bn' => 'আপনার সম্পত্তি'],

            // Marketing
            'marketing.freeAssessment' => ['en' => 'Free Assessment', 'bn' => 'বিনামূল্যে মূল্যায়ন'],
            'marketing.signIn' => ['en' => 'Sign In', 'bn' => 'সাইন ইন'],
            'marketing.getStarted' => ['en' => 'Get Started', 'bn' => 'শুরু করুন'],
            'marketing.tagline' => ['en' => 'Protect your property from anywhere', 'bn' => 'যেকোনো জায়গা থেকে আপনার সম্পত্তি রক্ষা করুন'],
            'marketing.about' => ['en' => 'About', 'bn' => 'সম্পর্কে'],
            'marketing.faq' => ['en' => 'FAQ', 'bn' => 'প্রশ্নোত্তর'],
            'marketing.contact' => ['en' => 'Contact', 'bn' => 'যোগাযোগ'],

            // Footer
            'footer.copyright' => ['en' => 'Wisebox. All rights reserved.', 'bn' => 'Wisebox। সর্বস্বত্ব সংরক্ষিত।'],
            'footer.privacy' => ['en' => 'Privacy Policy', 'bn' => 'গোপনীয়তা নীতি'],
            'footer.terms' => ['en' => 'Terms of Service', 'bn' => 'সেবার শর্তাবলি'],
        ];
    }

    // ── auth ──────────────────────────────────────────────────────

    private function auth(): array
    {
        return [
            'login.title' => ['en' => 'Welcome back', 'bn' => 'আবার স্বাগতম'],
            'login.subtitle' => ['en' => 'Sign in to your account', 'bn' => 'আপনার অ্যাকাউন্টে সাইন ইন করুন'],
            'login.emailLabel' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'login.emailPlaceholder' => ['en' => 'you@example.com', 'bn' => 'you@example.com'],
            'login.passwordLabel' => ['en' => 'Password', 'bn' => 'পাসওয়ার্ড'],
            'login.passwordPlaceholder' => ['en' => 'Enter your password', 'bn' => 'আপনার পাসওয়ার্ড লিখুন'],
            'login.forgotPassword' => ['en' => 'Forgot password?', 'bn' => 'পাসওয়ার্ড ভুলে গেছেন?'],
            'login.submit' => ['en' => 'Sign in', 'bn' => 'সাইন ইন'],
            'login.submitting' => ['en' => 'Signing in...', 'bn' => 'সাইন ইন হচ্ছে...'],
            'login.invalidCredentials' => ['en' => 'Invalid email or password', 'bn' => 'ভুল ইমেইল বা পাসওয়ার্ড'],
            'login.noAccount' => ['en' => "Don't have an account?", 'bn' => 'অ্যাকাউন্ট নেই?'],
            'login.createAccount' => ['en' => 'Create an account', 'bn' => 'অ্যাকাউন্ট তৈরি করুন'],
            'login.orContinueWith' => ['en' => 'Or continue with', 'bn' => 'অথবা চালিয়ে যান'],

            'register.title' => ['en' => 'Create your account', 'bn' => 'আপনার অ্যাকাউন্ট তৈরি করুন'],
            'register.subtitle' => ['en' => 'Start managing your properties', 'bn' => 'আপনার সম্পত্তি পরিচালনা শুরু করুন'],
            'register.nameLabel' => ['en' => 'Full name', 'bn' => 'পুরো নাম'],
            'register.namePlaceholder' => ['en' => 'Enter your full name', 'bn' => 'আপনার পুরো নাম লিখুন'],
            'register.emailLabel' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'register.emailPlaceholder' => ['en' => 'you@example.com', 'bn' => 'you@example.com'],
            'register.passwordLabel' => ['en' => 'Password', 'bn' => 'পাসওয়ার্ড'],
            'register.passwordPlaceholder' => ['en' => 'Create a password', 'bn' => 'একটি পাসওয়ার্ড তৈরি করুন'],
            'register.countryLabel' => ['en' => 'Country of residence', 'bn' => 'বসবাসের দেশ'],
            'register.countryPlaceholder' => ['en' => 'Select your country', 'bn' => 'আপনার দেশ নির্বাচন করুন'],
            'register.termsAgree' => ['en' => 'I agree to the', 'bn' => 'আমি সম্মত'],
            'register.termsAnd' => ['en' => 'and', 'bn' => 'এবং'],
            'register.submit' => ['en' => 'Create account', 'bn' => 'অ্যাকাউন্ট তৈরি করুন'],
            'register.submitting' => ['en' => 'Creating account...', 'bn' => 'অ্যাকাউন্ট তৈরি হচ্ছে...'],
            'register.registrationFailed' => ['en' => 'Registration failed', 'bn' => 'নিবন্ধন ব্যর্থ'],
            'register.hasAccount' => ['en' => 'Already have an account?', 'bn' => 'ইতিমধ্যে অ্যাকাউন্ট আছে?'],
            'register.logIn' => ['en' => 'Log in', 'bn' => 'লগ ইন'],
            'register.orContinueWith' => ['en' => 'Or continue with', 'bn' => 'অথবা চালিয়ে যান'],

            'forgotPassword.title' => ['en' => 'Reset your password', 'bn' => 'আপনার পাসওয়ার্ড রিসেট করুন'],
            'forgotPassword.subtitle' => ['en' => 'Enter your email and we\'ll send you a reset link', 'bn' => 'আপনার ইমেইল লিখুন, আমরা রিসেট লিংক পাঠাব'],
            'forgotPassword.emailLabel' => ['en' => 'Email address', 'bn' => 'ইমেইল ঠিকানা'],
            'forgotPassword.emailPlaceholder' => ['en' => 'you@example.com', 'bn' => 'you@example.com'],
            'forgotPassword.submit' => ['en' => 'Send reset link', 'bn' => 'রিসেট লিংক পাঠান'],
            'forgotPassword.submitting' => ['en' => 'Sending...', 'bn' => 'পাঠানো হচ্ছে...'],
            'forgotPassword.backToSignIn' => ['en' => 'Back to sign in', 'bn' => 'সাইন ইনে ফিরে যান'],
            'forgotPassword.checkEmail' => ['en' => 'Check your email', 'bn' => 'আপনার ইমেইল দেখুন'],
            'forgotPassword.checkEmailDescription' => ['en' => 'If an account exists with that email, you will receive a reset link shortly.', 'bn' => 'যদি ইমেইলে অ্যাকাউন্ট থাকে, শীঘ্রই রিসেট লিংক পাবেন।'],
            'forgotPassword.failedToSend' => ['en' => 'Failed to send reset link', 'bn' => 'রিসেট লিংক পাঠাতে ব্যর্থ'],
            'forgotPassword.secureAccess' => ['en' => 'Secure Access', 'bn' => 'নিরাপদ প্রবেশ'],
            'forgotPassword.secureDescription' => ['en' => 'Your account security is our priority', 'bn' => 'আপনার অ্যাকাউন্টের নিরাপত্তা আমাদের অগ্রাধিকার'],
            'forgotPassword.step1' => ['en' => 'Enter your registered email', 'bn' => 'আপনার নিবন্ধিত ইমেইল লিখুন'],
            'forgotPassword.step2' => ['en' => 'Check your inbox for the reset link', 'bn' => 'রিসেট লিংকের জন্য ইনবক্স দেখুন'],
            'forgotPassword.step3' => ['en' => 'Create a new password', 'bn' => 'একটি নতুন পাসওয়ার্ড তৈরি করুন'],
        ];
    }

    // ── dashboard ─────────────────────────────────────────────────

    private function dashboard(): array
    {
        return [
            'greeting' => ['en' => 'Welcome, {{name}}', 'bn' => 'স্বাগতম, {{name}}'],
            'greetingFallback' => ['en' => 'Welcome to Wisebox', 'bn' => 'Wisebox এ স্বাগতম'],
            'title' => ['en' => 'Dashboard', 'bn' => 'ড্যাশবোর্ড'],
            'loadingSummary' => ['en' => 'Loading your dashboard...', 'bn' => 'আপনার ড্যাশবোর্ড লোড হচ্ছে...'],
            'couldNotLoad' => ['en' => 'Could not load dashboard data.', 'bn' => 'ড্যাশবোর্ড ডেটা লোড করা যায়নি।'],
            'noPropertiesSubtitle' => ['en' => 'Add your first property to get started', 'bn' => 'শুরু করতে আপনার প্রথম সম্পত্তি যোগ করুন'],
            'propertiesCount' => ['en' => 'You have {{count}} properties', 'bn' => 'আপনার {{count}} টি সম্পত্তি আছে'],
            'addNewProperty' => ['en' => 'Add Property', 'bn' => 'সম্পত্তি যোগ করুন'],
            'getFreeAssessment' => ['en' => 'Get Free Assessment', 'bn' => 'বিনামূল্যে মূল্যায়ন নিন'],
            'completionTime' => ['en' => 'Takes about 5 minutes', 'bn' => 'প্রায় ৫ মিনিট সময় লাগে'],
            'myProperties' => ['en' => 'My Properties', 'bn' => 'আমার সম্পত্তি'],

            // Guide cards
            'exploreServices' => ['en' => 'Explore Services', 'bn' => 'সেবা দেখুন'],
            'exploreServicesDesc' => ['en' => 'Browse our professional property services', 'bn' => 'আমাদের পেশাদার সম্পত্তি সেবা দেখুন'],
            'talkToExpert' => ['en' => 'Talk to Expert', 'bn' => 'বিশেষজ্ঞের সাথে কথা বলুন'],
            'talkToExpertDesc' => ['en' => 'Get a free consultation with a property expert', 'bn' => 'সম্পত্তি বিশেষজ্ঞের সাথে বিনামূল্যে পরামর্শ নিন'],
            'learningCenter' => ['en' => 'Learning Center', 'bn' => 'শিক্ষা কেন্দ্র'],
            'learningCenterDesc' => ['en' => 'Learn about property management in Bangladesh', 'bn' => 'বাংলাদেশে সম্পত্তি ব্যবস্থাপনা সম্পর্কে জানুন'],

            // Hero banner
            'heroBanner.label' => ['en' => 'Wisebox', 'bn' => 'Wisebox'],
            'heroBanner.defaultTitle' => ['en' => 'Protect your property from anywhere', 'bn' => 'যেকোনো জায়গা থেকে আপনার সম্পত্তি রক্ষা করুন'],
        ];
    }

    // ── properties ────────────────────────────────────────────────

    private function properties(): array
    {
        return [
            // Page-level (properties: prefix)
            'addProperty' => ['en' => 'Add Property', 'bn' => 'সম্পত্তি যোগ করুন'],
            'title' => ['en' => 'My Properties', 'bn' => 'আমার সম্পত্তি'],
            'tabs.all' => ['en' => 'All', 'bn' => 'সব'],
            'tabs.active' => ['en' => 'Active', 'bn' => 'সক্রিয়'],
            'tabs.draft' => ['en' => 'Draft', 'bn' => 'খসড়া'],
            'tabs.verified' => ['en' => 'Verified', 'bn' => 'যাচাইকৃত'],

            // Breadcrumbs
            'breadcrumb.properties' => ['en' => 'Properties', 'bn' => 'সম্পত্তি'],
            'breadcrumb.addNew' => ['en' => 'Add New', 'bn' => 'নতুন যোগ করুন'],
            'breadcrumb.edit' => ['en' => 'Edit', 'bn' => 'সম্পাদনা'],

            // Detail page
            'detail.backToProperties' => ['en' => 'Back to Properties', 'bn' => 'সম্পত্তিতে ফিরুন'],
            'detail.notFound' => ['en' => 'Property not found', 'bn' => 'সম্পত্তি পাওয়া যায়নি'],
            'detail.deleteProperty' => ['en' => 'Delete Property', 'bn' => 'সম্পত্তি মুছুন'],
            'detail.deleteDescription' => ['en' => 'This action cannot be undone.', 'bn' => 'এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।'],
            'detail.deleteConfirmTitle' => ['en' => 'Delete this property?', 'bn' => 'এই সম্পত্তি মুছবেন?'],
            'detail.deleteFailed' => ['en' => 'Failed to delete property', 'bn' => 'সম্পত্তি মুছতে ব্যর্থ হয়েছে'],
            'detail.deleting' => ['en' => 'Deleting...', 'bn' => 'মুছা হচ্ছে...'],
            'detail.dangerZone' => ['en' => 'Danger Zone', 'bn' => 'বিপজ্জনক এলাকা'],
            'detail.recommendations' => ['en' => 'Recommendations', 'bn' => 'সুপারিশ'],
            'detail.recommendationsDesc' => ['en' => 'Personalized recommendations for your property', 'bn' => 'আপনার সম্পত্তির জন্য ব্যক্তিগতকৃত সুপারিশ'],
            'detail.consultationHistory' => ['en' => 'Consultation History', 'bn' => 'পরামর্শের ইতিহাস'],
            'detail.consultationHistoryDesc' => ['en' => 'Past and upcoming consultations for this property', 'bn' => 'এই সম্পত্তির জন্য পূর্ববর্তী ও আসন্ন পরামর্শ'],
            'detail.consultationResources' => ['en' => 'Consultation Resources', 'bn' => 'পরামর্শ সম্পদ'],

            // New property wizard
            'new.title' => ['en' => 'Add New Property', 'bn' => 'নতুন সম্পত্তি যোগ করুন'],
            'new.step1Title' => ['en' => 'Property Details', 'bn' => 'সম্পত্তির বিবরণ'],
            'new.step2Title' => ['en' => 'Documents', 'bn' => 'দলিলপত্র'],
            'new.propertyNameRequired' => ['en' => 'Property name is required', 'bn' => 'সম্পত্তির নাম আবশ্যক'],
            'new.propertyNamePlaceholder' => ['en' => 'e.g., Family home in Dhaka', 'bn' => 'যেমন, ঢাকায় পারিবারিক বাড়ি'],
            'new.propertyTypeRequired' => ['en' => 'Property type is required', 'bn' => 'সম্পত্তির ধরন আবশ্যক'],
            'new.ownershipStatusRequired' => ['en' => 'Ownership status is required', 'bn' => 'মালিকানার স্থিতি আবশ্যক'],
            'new.ownershipStatusDesc' => ['en' => 'Your legal ownership status for this property', 'bn' => 'এই সম্পত্তিতে আপনার আইনি মালিকানার স্থিতি'],
            'new.ownershipTypeRequired' => ['en' => 'Ownership type is required', 'bn' => 'মালিকানার ধরন আবশ্যক'],
            'new.ownershipTypeDesc' => ['en' => 'How the property is owned', 'bn' => 'সম্পত্তি কীভাবে মালিকানাধীন'],
            'new.locationTitle' => ['en' => 'Location', 'bn' => 'অবস্থান'],
            'new.address' => ['en' => 'Address', 'bn' => 'ঠিকানা'],
            'new.addressPlaceholder' => ['en' => 'House/road/area details', 'bn' => 'বাড়ি/রাস্তা/এলাকার বিস্তারিত'],
            'new.country' => ['en' => 'Country', 'bn' => 'দেশ'],
            'new.size' => ['en' => 'Size', 'bn' => 'আয়তন'],
            'new.sizePlaceholder' => ['en' => 'Enter size', 'bn' => 'আয়তন লিখুন'],
            'new.unitLabel' => ['en' => 'Unit', 'bn' => 'একক'],
            'new.selectUnit' => ['en' => 'Select unit', 'bn' => 'একক নির্বাচন করুন'],
            'new.descriptionOptional' => ['en' => 'Description (optional)', 'bn' => 'বিবরণ (ঐচ্ছিক)'],
            'new.descriptionPlaceholder' => ['en' => 'Any additional details about this property', 'bn' => 'এই সম্পত্তি সম্পর্কে যেকোনো অতিরিক্ত তথ্য'],
            'new.coOwners' => ['en' => 'Co-Owners', 'bn' => 'সহ-মালিক'],
            'new.fixCoOwnerDetails' => ['en' => 'Please fix co-owner details before continuing', 'bn' => 'চালিয়ে যাওয়ার আগে সহ-মালিকের তথ্য ঠিক করুন'],
            'new.primaryDocuments' => ['en' => 'Primary Documents', 'bn' => 'প্রাথমিক দলিল'],
            'new.primaryDocsDesc' => ['en' => 'Core documents required to establish ownership', 'bn' => 'মালিকানা প্রতিষ্ঠার জন্য প্রয়োজনীয় মূল দলিল'],
            'new.secondaryDocuments' => ['en' => 'Secondary Documents', 'bn' => 'গৌণ দলিল'],
            'new.secondaryDocsDesc' => ['en' => 'Supporting documents for your property', 'bn' => 'আপনার সম্পত্তির সহায়ক দলিল'],
            'new.noDocTypes' => ['en' => 'No document types found', 'bn' => 'কোনো দলিলের ধরন পাওয়া যায়নি'],
            'new.saveAndContinue' => ['en' => 'Save & Continue', 'bn' => 'সংরক্ষণ করুন ও চালিয়ে যান'],
            'new.finish' => ['en' => 'Finish', 'bn' => 'সম্পন্ন করুন'],
            'new.creating' => ['en' => 'Creating...', 'bn' => 'তৈরি হচ্ছে...'],
            'new.createFailed' => ['en' => 'Failed to create property', 'bn' => 'সম্পত্তি তৈরিতে ব্যর্থ হয়েছে'],

            // Edit form
            'edit.basicInfo' => ['en' => 'Basic Information', 'bn' => 'মূল তথ্য'],
            'edit.name' => ['en' => 'Name', 'bn' => 'নাম'],
            'edit.propertyName' => ['en' => 'Property Name', 'bn' => 'সম্পত্তির নাম'],
            'edit.propertyNamePlaceholder' => ['en' => 'e.g., Family home in Dhaka', 'bn' => 'যেমন, ঢাকায় পারিবারিক বাড়ি'],
            'edit.propertyType' => ['en' => 'Property Type', 'bn' => 'সম্পত্তির ধরন'],
            'edit.selectType' => ['en' => 'Select type', 'bn' => 'ধরন নির্বাচন করুন'],
            'edit.ownershipStatus' => ['en' => 'Ownership Status', 'bn' => 'মালিকানার স্থিতি'],
            'edit.selectStatus' => ['en' => 'Select status', 'bn' => 'স্থিতি নির্বাচন করুন'],
            'edit.ownershipType' => ['en' => 'Ownership Type', 'bn' => 'মালিকানার ধরন'],
            'edit.ownershipPercent' => ['en' => 'Ownership %', 'bn' => 'মালিকানা %'],
            'edit.location' => ['en' => 'Location', 'bn' => 'অবস্থান'],
            'edit.division' => ['en' => 'Division', 'bn' => 'বিভাগ'],
            'edit.selectDivision' => ['en' => 'Select division', 'bn' => 'বিভাগ নির্বাচন করুন'],
            'edit.district' => ['en' => 'District', 'bn' => 'জেলা'],
            'edit.selectDistrict' => ['en' => 'Select district', 'bn' => 'জেলা নির্বাচন করুন'],
            'edit.upazila' => ['en' => 'Upazila', 'bn' => 'উপজেলা'],
            'edit.selectUpazila' => ['en' => 'Select upazila', 'bn' => 'উপজেলা নির্বাচন করুন'],
            'edit.mouza' => ['en' => 'Mouza', 'bn' => 'মৌজা'],
            'edit.selectMouza' => ['en' => 'Select mouza', 'bn' => 'মৌজা নির্বাচন করুন'],
            'edit.addressOptional' => ['en' => 'Address (optional)', 'bn' => 'ঠিকানা (ঐচ্ছিক)'],
            'edit.addressPlaceholder' => ['en' => 'House/road/area details', 'bn' => 'বাড়ি/রাস্তা/এলাকার বিস্তারিত'],
            'edit.sizeOptional' => ['en' => 'Size (optional)', 'bn' => 'আয়তন (ঐচ্ছিক)'],
            'edit.unit' => ['en' => 'Unit', 'bn' => 'একক'],
            'edit.selectUnit' => ['en' => 'Select unit', 'bn' => 'একক নির্বাচন করুন'],
            'edit.descriptionOptional' => ['en' => 'Description (optional)', 'bn' => 'বিবরণ (ঐচ্ছিক)'],
            'edit.descriptionPlaceholder' => ['en' => 'Any additional details about this property', 'bn' => 'এই সম্পত্তি সম্পর্কে যেকোনো অতিরিক্ত তথ্য'],
            'edit.coOwners' => ['en' => 'Co-Owners', 'bn' => 'সহ-মালিক'],
            'edit.noCoOwners' => ['en' => 'No co-owners added', 'bn' => 'কোনো সহ-মালিক যোগ করা হয়নি'],
            'edit.addCoOwner' => ['en' => 'Add Co-Owner', 'bn' => 'সহ-মালিক যোগ করুন'],
            'edit.fullName' => ['en' => 'Full Name', 'bn' => 'পুরো নাম'],
            'edit.email' => ['en' => 'Email', 'bn' => 'ইমেইল'],
            'edit.phone' => ['en' => 'Phone', 'bn' => 'ফোন'],
            'edit.relationship' => ['en' => 'Relationship', 'bn' => 'সম্পর্ক'],
            'edit.relationshipPlaceholder' => ['en' => 'e.g., Spouse, Parent', 'bn' => 'যেমন, স্বামী/স্ত্রী, বাবা/মা'],
            'edit.saveChanges' => ['en' => 'Save Changes', 'bn' => 'পরিবর্তন সংরক্ষণ করুন'],
            'edit.updateFailed' => ['en' => 'Failed to update property', 'bn' => 'সম্পত্তি আপডেট করতে ব্যর্থ হয়েছে'],

            // Documents component (bare keys)
            'documents.failedToLoad' => ['en' => 'Failed to load documents', 'bn' => 'দলিল লোড করতে ব্যর্থ হয়েছে'],
            'documents.title' => ['en' => 'Documents', 'bn' => 'দলিলপত্র'],
            'documents.completion' => ['en' => '{{percent}}% complete', 'bn' => '{{percent}}% সম্পূর্ণ'],
            'documents.primaryDocuments' => ['en' => 'Primary Documents', 'bn' => 'প্রাথমিক দলিল'],
            'documents.secondaryDocuments' => ['en' => 'Secondary Documents', 'bn' => 'গৌণ দলিল'],
            'documents.uploadFailed' => ['en' => 'Upload failed', 'bn' => 'আপলোড ব্যর্থ হয়েছে'],
            'documents.uploading' => ['en' => 'Uploading...', 'bn' => 'আপলোড হচ্ছে...'],
            'documents.dropFileHere' => ['en' => 'Drop file here', 'bn' => 'ফাইল এখানে ছেড়ে দিন'],
            'documents.pts' => ['en' => 'pts', 'bn' => 'পয়েন্ট'],
            'documents.clickOrDragUpload' => ['en' => 'Click or drag to upload', 'bn' => 'আপলোড করতে ক্লিক করুন বা টেনে আনুন'],
            'documents.couldNotMarkMissing' => ['en' => 'Could not mark document as missing', 'bn' => 'দলিল অনুপস্থিত হিসেবে চিহ্নিত করা যায়নি'],
            'documents.documentUploaded' => ['en' => 'Document uploaded', 'bn' => 'দলিল আপলোড হয়েছে'],
            'documents.markedAsMissing' => ['en' => 'Marked as missing', 'bn' => 'অনুপস্থিত হিসেবে চিহ্নিত'],
            'documents.fileRejected' => ['en' => 'File rejected', 'bn' => 'ফাইল প্রত্যাখ্যাত'],
            'documents.dropHere' => ['en' => 'Drop here', 'bn' => 'এখানে ছেড়ে দিন'],
            'documents.iHaveThis' => ['en' => 'I have this', 'bn' => 'আমার কাছে আছে'],
            'documents.iDontHaveThis' => ['en' => "I don't have this", 'bn' => 'আমার কাছে নেই'],
            'documents.actuallyDontHave' => ['en' => "Actually, I don't have it", 'bn' => 'আসলে, আমার কাছে নেই'],
            'documents.iFoundIt' => ['en' => 'I found it', 'bn' => 'আমি খুঁজে পেয়েছি'],
            'documents.dontHave' => ['en' => "Don't have", 'bn' => 'নেই'],
            'documents.have' => ['en' => 'Have', 'bn' => 'আছে'],
            'documents.required' => ['en' => 'Required', 'bn' => 'প্রয়োজনীয়'],
            'documents.primary' => ['en' => 'Primary', 'bn' => 'প্রাথমিক'],
            'documents.secondary' => ['en' => 'Secondary', 'bn' => 'গৌণ'],
            'documents.whatIsThis' => ['en' => 'What is this?', 'bn' => 'এটি কী?'],
            'documents.replace' => ['en' => 'Replace', 'bn' => 'প্রতিস্থাপন করুন'],
            'documents.noAdditionalGuidance' => ['en' => 'No additional guidance available', 'bn' => 'কোনো অতিরিক্ত নির্দেশিকা নেই'],
            'documents.whereToGetIt' => ['en' => 'Where to get it', 'bn' => 'কোথায় পাবেন'],
            'documents.ifMissing' => ['en' => 'If missing', 'bn' => 'না থাকলে'],
            'documents.requiredFor' => ['en' => 'Required for', 'bn' => 'যার জন্য প্রয়োজন'],
            'documents.estimatedCost' => ['en' => 'Estimated cost', 'bn' => 'আনুমানিক খরচ'],
            'documents.estimatedTime' => ['en' => 'Estimated time', 'bn' => 'আনুমানিক সময়'],
            'documents.tips' => ['en' => 'Tips', 'bn' => 'পরামর্শ'],
            'documents.notSpecified' => ['en' => 'Not specified', 'bn' => 'উল্লেখ নেই'],
            'documents.documentChecklist' => ['en' => 'Document Checklist', 'bn' => 'দলিল চেকলিস্ট'],

            // Co-owner fields component
            'coOwnerFields.yourOwnership' => ['en' => 'Your ownership: {{percent}}%', 'bn' => 'আপনার মালিকানা: {{percent}}%'],
            'coOwnerFields.totalExceeds' => ['en' => 'Total ownership exceeds 100%', 'bn' => 'মোট মালিকানা ১০০% ছাড়িয়ে গেছে'],
            'coOwnerFields.coOwnerIndex' => ['en' => 'Co-Owner {{index}}', 'bn' => 'সহ-মালিক {{index}}'],
            'coOwnerFields.nameRequired' => ['en' => 'Name is required', 'bn' => 'নাম আবশ্যক'],
            'coOwnerFields.fullName' => ['en' => 'Full Name', 'bn' => 'পুরো নাম'],
            'coOwnerFields.relationshipRequired' => ['en' => 'Relationship is required', 'bn' => 'সম্পর্ক আবশ্যক'],
            'coOwnerFields.selectRelationship' => ['en' => 'Select relationship', 'bn' => 'সম্পর্ক নির্বাচন করুন'],
            'coOwnerFields.relationships.spouse' => ['en' => 'Spouse', 'bn' => 'স্বামী/স্ত্রী'],
            'coOwnerFields.relationships.parent' => ['en' => 'Parent', 'bn' => 'বাবা/মা'],
            'coOwnerFields.relationships.sibling' => ['en' => 'Sibling', 'bn' => 'ভাই/বোন'],
            'coOwnerFields.relationships.child' => ['en' => 'Child', 'bn' => 'সন্তান'],
            'coOwnerFields.relationships.other' => ['en' => 'Other', 'bn' => 'অন্যান্য'],
            'coOwnerFields.ownershipRequired' => ['en' => 'Ownership percentage is required', 'bn' => 'মালিকানার শতকরা হার আবশ্যক'],
            'coOwnerFields.ownershipPlaceholder' => ['en' => 'e.g., 50', 'bn' => 'যেমন, ৫০'],
            'coOwnerFields.phone' => ['en' => 'Phone', 'bn' => 'ফোন'],
            'coOwnerFields.email' => ['en' => 'Email', 'bn' => 'ইমেইল'],
            'coOwnerFields.addCoOwner' => ['en' => 'Add Co-Owner', 'bn' => 'সহ-মালিক যোগ করুন'],

            // Location cascade component
            'locationCascade.division' => ['en' => 'Division', 'bn' => 'বিভাগ'],
            'locationCascade.loading' => ['en' => 'Loading...', 'bn' => 'লোড হচ্ছে...'],
            'locationCascade.selectDivision' => ['en' => 'Select division', 'bn' => 'বিভাগ নির্বাচন করুন'],
            'locationCascade.district' => ['en' => 'District', 'bn' => 'জেলা'],
            'locationCascade.selectDivisionFirst' => ['en' => 'Select division first', 'bn' => 'আগে বিভাগ নির্বাচন করুন'],
            'locationCascade.selectDistrict' => ['en' => 'Select district', 'bn' => 'জেলা নির্বাচন করুন'],
            'locationCascade.upazila' => ['en' => 'Upazila', 'bn' => 'উপজেলা'],
            'locationCascade.selectDistrictFirst' => ['en' => 'Select district first', 'bn' => 'আগে জেলা নির্বাচন করুন'],
            'locationCascade.selectUpazila' => ['en' => 'Select upazila', 'bn' => 'উপজেলা নির্বাচন করুন'],
            'locationCascade.mouza' => ['en' => 'Mouza', 'bn' => 'মৌজা'],
            'locationCascade.selectUpazilaFirst' => ['en' => 'Select upazila first', 'bn' => 'আগে উপজেলা নির্বাচন করুন'],
            'locationCascade.selectMouza' => ['en' => 'Select mouza', 'bn' => 'মৌজা নির্বাচন করুন'],
            'locationCascade.noMouzaAvailable' => ['en' => 'No mouza available', 'bn' => 'কোনো মৌজা পাওয়া যায়নি'],
            'locationCascade.noMouzaForUpazila' => ['en' => 'No mouza for this upazila', 'bn' => 'এই উপজেলার জন্য কোনো মৌজা নেই'],

            // Overview component
            'overview.ownership' => ['en' => 'Ownership', 'bn' => 'মালিকানা'],
            'overview.ownershipStatus' => ['en' => 'Ownership Status', 'bn' => 'মালিকানার স্থিতি'],
            'overview.ownershipType' => ['en' => 'Ownership Type', 'bn' => 'মালিকানার ধরন'],
            'overview.location' => ['en' => 'Location', 'bn' => 'অবস্থান'],
            'overview.address' => ['en' => 'Address', 'bn' => 'ঠিকানা'],
            'overview.size' => ['en' => 'Size', 'bn' => 'আয়তন'],
            'overview.description' => ['en' => 'Description', 'bn' => 'বিবরণ'],
            'overview.editProperty' => ['en' => 'Edit Property', 'bn' => 'সম্পত্তি সম্পাদনা করুন'],
            'overview.created' => ['en' => 'Created', 'bn' => 'তৈরির তারিখ'],
            'overview.coOwnedBy' => ['en' => 'Co-owned by {{name}}', 'bn' => '{{name}} এর সাথে যৌথ মালিকানা'],
            'overview.coOwnedByPlural' => ['en' => 'Co-owned by {{count}} people', 'bn' => '{{count}} জনের সাথে যৌথ মালিকানা'],
            'overview.more' => ['en' => '+{{count}} more', 'bn' => '+{{count}} আরো'],

            // Status badges
            'status.draft' => ['en' => 'Draft', 'bn' => 'খসড়া'],
            'status.active' => ['en' => 'Active', 'bn' => 'সক্রিয়'],
            'status.verified' => ['en' => 'Verified', 'bn' => 'যাচাইকৃত'],
            'status.rejected' => ['en' => 'Rejected', 'bn' => 'প্রত্যাখ্যাত'],

            // Sidebar
            'sidebar.yourProperty' => ['en' => 'Your Property', 'bn' => 'আপনার সম্পত্তি'],
            'sidebar.journal' => ['en' => 'Journal', 'bn' => 'জার্নাল'],
            'sidebar.analytics' => ['en' => 'Analytics', 'bn' => 'বিশ্লেষণ'],
            'sidebar.consult' => ['en' => 'Consult', 'bn' => 'পরামর্শ'],
            'sidebar.needHelp' => ['en' => 'Need Help?', 'bn' => 'সাহায্য দরকার?'],
            'sidebar.dontHavePapers' => ['en' => "Don't have all your papers?", 'bn' => 'সব কাগজপত্র নেই?'],
            'sidebar.dontHavePapersDesc' => ['en' => 'Our consultants can help you track down missing documents.', 'bn' => 'আমাদের পরামর্শদাতারা আপনাকে হারানো দলিল খুঁজে পেতে সাহায্য করতে পারেন।'],
            'sidebar.exploreServices' => ['en' => 'Explore Services', 'bn' => 'সেবা দেখুন'],
            'sidebar.faq' => ['en' => 'FAQ', 'bn' => 'প্রশ্নোত্তর'],
            'sidebar.faqQ1' => ['en' => 'What documents do I need?', 'bn' => 'আমার কী কী দলিল দরকার?'],
            'sidebar.faqA1' => ['en' => 'Required documents depend on your property type and ownership status.', 'bn' => 'প্রয়োজনীয় দলিল আপনার সম্পত্তির ধরন ও মালিকানার স্থিতির উপর নির্ভর করে।'],
            'sidebar.faqQ2' => ['en' => 'How do I verify my property?', 'bn' => 'আমার সম্পত্তি কীভাবে যাচাই করব?'],
            'sidebar.faqA2' => ['en' => 'Upload all required documents and request a verification consultation.', 'bn' => 'সব প্রয়োজনীয় দলিল আপলোড করুন এবং যাচাই পরামর্শ অনুরোধ করুন।'],
            'sidebar.faqQ3' => ['en' => 'What if I am missing documents?', 'bn' => 'কোনো দলিল না থাকলে কী করব?'],
            'sidebar.faqA3' => ['en' => 'Mark them as missing and our consultants can guide you.', 'bn' => 'সেগুলো অনুপস্থিত হিসেবে চিহ্নিত করুন এবং আমাদের পরামর্শদাতারা আপনাকে সাহায্য করবেন।'],
            'sidebar.faqQ4' => ['en' => 'How long does verification take?', 'bn' => 'যাচাই করতে কতদিন লাগে?'],
            'sidebar.faqA4' => ['en' => 'Typically 7-14 business days after all documents are submitted.', 'bn' => 'সব দলিল জমা দেওয়ার পর সাধারণত ৭-১৪ কার্যদিবস লাগে।'],

            // Card
            'card.coOwner' => ['en' => 'Co-owner', 'bn' => 'সহ-মালিক'],
            'card.coOwners' => ['en' => 'co-owners', 'bn' => 'সহ-মালিক'],

            // Assessment
            'assessment.title' => ['en' => 'Property Assessment', 'bn' => 'সম্পত্তি মূল্যায়ন'],
            'assessment.viewServices' => ['en' => 'View Services', 'bn' => 'সেবা দেখুন'],
            'assessment.history' => ['en' => 'Assessment History', 'bn' => 'মূল্যায়নের ইতিহাস'],
            'assessment.noAssessments' => ['en' => 'No assessments yet', 'bn' => 'এখনও কোনো মূল্যায়ন নেই'],
            'assessment.noSummary' => ['en' => 'No summary available', 'bn' => 'কোনো সারাংশ নেই'],

            // Free consultation dialog
            'freeConsultation.triggerButton' => ['en' => 'Book Free Consultation', 'bn' => 'বিনামূল্যে পরামর্শ বুক করুন'],
            'freeConsultation.successTitle' => ['en' => 'Request submitted!', 'bn' => 'অনুরোধ জমা হয়েছে!'],
            'freeConsultation.successDescription' => ['en' => 'We will review your request and get back to you shortly.', 'bn' => 'আমরা আপনার অনুরোধ পর্যালোচনা করে শীঘ্রই যোগাযোগ করব।'],
            'freeConsultation.dialogTitle' => ['en' => 'Book a Free Consultation', 'bn' => 'বিনামূল্যে পরামর্শ বুক করুন'],
            'freeConsultation.dialogDescription' => ['en' => 'Tell us about what you need help with', 'bn' => 'আপনার কী সাহায্য দরকার তা বলুন'],
            'freeConsultation.whatHelpNeeded' => ['en' => 'What do you need help with?', 'bn' => 'আপনার কী বিষয়ে সাহায্য দরকার?'],
            'freeConsultation.descriptionPlaceholder' => ['en' => 'Describe your situation...', 'bn' => 'আপনার পরিস্থিতি বর্ণনা করুন...'],
            'freeConsultation.charCount' => ['en' => '{{count}} characters', 'bn' => '{{count}} অক্ষর'],
            'freeConsultation.infoFree' => ['en' => 'This consultation is completely free', 'bn' => 'এই পরামর্শ সম্পূর্ণ বিনামূল্যে'],
            'freeConsultation.infoReview' => ['en' => 'Our team will review your request', 'bn' => 'আমাদের দল আপনার অনুরোধ পর্যালোচনা করবে'],
            'freeConsultation.infoCalendar' => ['en' => 'You will receive a calendar invite', 'bn' => 'আপনি একটি ক্যালেন্ডার আমন্ত্রণ পাবেন'],
            'freeConsultation.submitting' => ['en' => 'Submitting...', 'bn' => 'জমা হচ্ছে...'],
            'freeConsultation.submitButton' => ['en' => 'Submit Request', 'bn' => 'অনুরোধ জমা দিন'],
            'freeConsultation.submitFailed' => ['en' => 'Failed to submit request', 'bn' => 'অনুরোধ জমা দিতে ব্যর্থ হয়েছে'],

            // Consultation tab
            'consultation.loading' => ['en' => 'Loading consultation...', 'bn' => 'পরামর্শ লোড হচ্ছে...'],
            'consultation.title' => ['en' => 'Consultation', 'bn' => 'পরামর্শ'],
            'consultation.description' => ['en' => 'Your consultation details', 'bn' => 'আপনার পরামর্শের বিস্তারিত'],
            'consultation.needExpertHelp' => ['en' => 'Need expert help?', 'bn' => 'বিশেষজ্ঞের সাহায্য দরকার?'],
            'consultation.expertHelpDesc' => ['en' => 'Book a free consultation with one of our property experts.', 'bn' => 'আমাদের সম্পত্তি বিশেষজ্ঞদের একজনের সাথে বিনামূল্যে পরামর্শ বুক করুন।'],
            'consultation.history' => ['en' => 'Consultation History', 'bn' => 'পরামর্শের ইতিহাস'],
            'consultation.consultant' => ['en' => 'Consultant', 'bn' => 'পরামর্শদাতা'],
            'consultation.with' => ['en' => 'with', 'bn' => 'এর সাথে'],
            'consultation.consultationNotes' => ['en' => 'Consultation Notes', 'bn' => 'পরামর্শ নোট'],
            'consultation.joinGoogleMeet' => ['en' => 'Join Google Meet', 'bn' => 'Google Meet এ যোগ দিন'],
            'consultation.viewFullDetails' => ['en' => 'View Full Details', 'bn' => 'সম্পূর্ণ বিস্তারিত দেখুন'],
            'consultation.bookAnother' => ['en' => 'Book Another', 'bn' => 'আরেকটি বুক করুন'],

            // Recommendations tab
            'recommendations.title' => ['en' => 'Recommendations', 'bn' => 'সুপারিশ'],
            'recommendations.subtitle' => ['en' => 'Personalized recommendations based on your property', 'bn' => 'আপনার সম্পত্তির উপর ভিত্তি করে ব্যক্তিগতকৃত সুপারিশ'],
            'recommendations.loading' => ['en' => 'Loading recommendations...', 'bn' => 'সুপারিশ লোড হচ্ছে...'],
            'recommendations.noRecommendations' => ['en' => 'No recommendations yet', 'bn' => 'এখনও কোনো সুপারিশ নেই'],
            'recommendations.categories' => ['en' => 'Categories', 'bn' => 'বিভাগসমূহ'],
            'recommendations.totalRecommendations' => ['en' => '{{count}} recommendations', 'bn' => '{{count}} টি সুপারিশ'],
            'recommendations.consultants' => ['en' => 'Consultants', 'bn' => 'পরামর্শদাতা'],
            'recommendations.important' => ['en' => 'Important', 'bn' => 'গুরুত্বপূর্ণ'],
            'recommendations.importantDescription' => ['en' => 'These items require your attention', 'bn' => 'এই বিষয়গুলো আপনার মনোযোগ প্রয়োজন'],

            // Journal tab
            'journal.title' => ['en' => 'Journal', 'bn' => 'জার্নাল'],
            'journal.loading' => ['en' => 'Loading journal...', 'bn' => 'জার্নাল লোড হচ্ছে...'],
            'journal.noConsultations' => ['en' => 'No consultations yet', 'bn' => 'এখনও কোনো পরামর্শ নেই'],
            'journal.totalConsultations' => ['en' => '{{count}} consultations', 'bn' => '{{count}} টি পরামর্শ'],
            'journal.summary' => ['en' => 'Summary', 'bn' => 'সারাংশ'],
            'journal.consultationNotes' => ['en' => 'Consultation Notes', 'bn' => 'পরামর্শ নোট'],
            'journal.formsCompletedTitle' => ['en' => 'Forms Completed', 'bn' => 'পূর্ণ ফর্মসমূহ'],
            'journal.completed' => ['en' => 'Completed', 'bn' => 'সম্পন্ন'],
        ];
    }

    // ── tickets ───────────────────────────────────────────────────

    private function tickets(): array
    {
        return [
            // Page level
            'title' => ['en' => 'My Tickets', 'bn' => 'আমার টিকেট'],
            'subtitleCustomer' => ['en' => 'Track your service requests and consultations', 'bn' => 'আপনার সেবা অনুরোধ ও পরামর্শ ট্র্যাক করুন'],
            'subtitleConsultant' => ['en' => 'Manage your assigned cases', 'bn' => 'আপনার নিযুক্ত কেসগুলো পরিচালনা করুন'],
            'couldNotLoad' => ['en' => 'Could not load tickets', 'bn' => 'টিকেট লোড করা যায়নি'],
            'loadingTickets' => ['en' => 'Loading tickets...', 'bn' => 'টিকেট লোড হচ্ছে...'],
            'refreshing' => ['en' => 'Refreshing...', 'bn' => 'রিফ্রেশ হচ্ছে...'],
            'openTicket' => ['en' => 'Open Ticket', 'bn' => 'টিকেট খুলুন'],
            'viewOrders' => ['en' => 'View Orders', 'bn' => 'অর্ডার দেখুন'],

            // Tabs
            'tabs.all' => ['en' => 'All', 'bn' => 'সব'],
            'tabs.open' => ['en' => 'Open', 'bn' => 'খোলা'],
            'tabs.in_progress' => ['en' => 'In Progress', 'bn' => 'চলমান'],
            'tabs.awaiting_consultant' => ['en' => 'Awaiting Consultant', 'bn' => 'পরামর্শদাতার অপেক্ষায়'],
            'tabs.awaiting_customer' => ['en' => 'Awaiting You', 'bn' => 'আপনার অপেক্ষায়'],
            'tabs.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'tabs.completed' => ['en' => 'Completed', 'bn' => 'সম্পন্ন'],

            // Filters
            'filters.allAssignments' => ['en' => 'All assignments', 'bn' => 'সব নিয়োগ'],
            'filters.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'filters.unassigned' => ['en' => 'Unassigned', 'bn' => 'অনিযুক্ত'],

            // Fields
            'fields.customer' => ['en' => 'Customer', 'bn' => 'গ্রাহক'],
            'fields.consultant' => ['en' => 'Consultant', 'bn' => 'পরামর্শদাতা'],
            'fields.property' => ['en' => 'Property', 'bn' => 'সম্পত্তি'],
            'fields.service' => ['en' => 'Service', 'bn' => 'সেবা'],
            'fields.priority' => ['en' => 'Priority', 'bn' => 'অগ্রাধিকার'],
            'fields.updated' => ['en' => 'Updated', 'bn' => 'আপডেট'],

            // Empty state
            'empty.title' => ['en' => 'No tickets yet', 'bn' => 'এখনও কোনো টিকেট নেই'],
            'empty.description' => ['en' => 'Book a service to get started', 'bn' => 'শুরু করতে একটি সেবা বুক করুন'],
            'empty.bookServices' => ['en' => 'Book Services', 'bn' => 'সেবা বুক করুন'],

            // Detail page
            'detail.loading' => ['en' => 'Loading ticket...', 'bn' => 'টিকেট লোড হচ্ছে...'],
            'detail.notFound' => ['en' => 'Ticket not found', 'bn' => 'টিকেট পাওয়া যায়নি'],
            'detail.backToTickets' => ['en' => 'Back to Tickets', 'bn' => 'টিকেটে ফিরুন'],
            'detail.customer' => ['en' => 'Customer', 'bn' => 'গ্রাহক'],
            'detail.user' => ['en' => 'User', 'bn' => 'ব্যবহারকারী'],
            'detail.consultant' => ['en' => 'Consultant', 'bn' => 'পরামর্শদাতা'],
            'detail.property' => ['en' => 'Property', 'bn' => 'সম্পত্তি'],
            'detail.service' => ['en' => 'Service', 'bn' => 'সেবা'],
            'detail.priority' => ['en' => 'Priority', 'bn' => 'অগ্রাধিকার'],
            'detail.scheduledFor' => ['en' => 'Scheduled For', 'bn' => 'নির্ধারিত সময়'],
            'detail.meeting' => ['en' => 'Meeting', 'bn' => 'মিটিং'],
            'detail.joinMeeting' => ['en' => 'Join Meeting', 'bn' => 'মিটিংয়ে যোগ দিন'],
            'detail.mins' => ['en' => 'mins', 'bn' => 'মিনিট'],
            'detail.created' => ['en' => 'Created', 'bn' => 'তৈরি'],
            'detail.statusLabel' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'detail.selectStatus' => ['en' => 'Select status', 'bn' => 'স্থিতি নির্বাচন করুন'],
            'detail.updateStatus' => ['en' => 'Update Status', 'bn' => 'স্থিতি আপডেট করুন'],
            'detail.selectConsultant' => ['en' => 'Select consultant', 'bn' => 'পরামর্শদাতা নির্বাচন করুন'],
            'detail.assignConsultant' => ['en' => 'Assign Consultant', 'bn' => 'পরামর্শদাতা নিযুক্ত করুন'],
            'detail.assign' => ['en' => 'Assign', 'bn' => 'নিযুক্ত করুন'],
            'detail.assigning' => ['en' => 'Assigning...', 'bn' => 'নিযুক্ত হচ্ছে...'],
            'detail.couldNotAssignConsultant' => ['en' => 'Could not assign consultant', 'bn' => 'পরামর্শদাতা নিযুক্ত করা যায়নি'],
            'detail.couldNotUpdateStatus' => ['en' => 'Could not update status', 'bn' => 'স্থিতি আপডেট করা যায়নি'],
            'detail.couldNotGenerateLink' => ['en' => 'Could not generate scheduling link', 'bn' => 'শিডিউলিং লিংক তৈরি করা যায়নি'],
            'detail.couldNotSendComment' => ['en' => 'Could not send comment', 'bn' => 'মন্তব্য পাঠানো যায়নি'],
            'detail.ticketCancelled' => ['en' => 'Ticket cancelled', 'bn' => 'টিকেট বাতিল করা হয়েছে'],
            'detail.conversation' => ['en' => 'Conversation', 'bn' => 'কথোপকথন'],
            'detail.conversationRequired' => ['en' => 'Message is required', 'bn' => 'বার্তা আবশ্যক'],
            'detail.noComments' => ['en' => 'No messages yet', 'bn' => 'এখনও কোনো বার্তা নেই'],
            'detail.writeMessage' => ['en' => 'Write a message...', 'bn' => 'একটি বার্তা লিখুন...'],
            'detail.sendMessage' => ['en' => 'Send', 'bn' => 'পাঠান'],
            'detail.sending' => ['en' => 'Sending...', 'bn' => 'পাঠানো হচ্ছে...'],
            'detail.internal' => ['en' => 'Internal', 'bn' => 'অভ্যন্তরীণ'],
            'detail.markAsInternal' => ['en' => 'Mark as internal note', 'bn' => 'অভ্যন্তরীণ নোট হিসেবে চিহ্নিত করুন'],
            'detail.statusTimeline' => ['en' => 'Status Timeline', 'bn' => 'স্থিতির সময়রেখা'],
            'detail.getSchedulingLink' => ['en' => 'Get Scheduling Link', 'bn' => 'শিডিউলিং লিংক পান'],
            'detail.generatingLink' => ['en' => 'Generating link...', 'bn' => 'লিংক তৈরি হচ্ছে...'],
            'detail.latestLink' => ['en' => 'Latest scheduling link', 'bn' => 'সর্বশেষ শিডিউলিং লিংক'],
            'detail.noMeetingScheduled' => ['en' => 'No meeting scheduled yet', 'bn' => 'এখনও কোনো মিটিং নির্ধারিত হয়নি'],

            // Timeline statuses
            'detail.timeline.open' => ['en' => 'Open', 'bn' => 'খোলা'],
            'detail.timeline.assigned' => ['en' => 'Assigned', 'bn' => 'নিযুক্ত'],
            'detail.timeline.in_progress' => ['en' => 'In Progress', 'bn' => 'চলমান'],
            'detail.timeline.awaiting_consultant' => ['en' => 'Awaiting Consultant', 'bn' => 'পরামর্শদাতার অপেক্ষায়'],
            'detail.timeline.awaiting_customer' => ['en' => 'Awaiting Customer', 'bn' => 'গ্রাহকের অপেক্ষায়'],
            'detail.timeline.scheduled' => ['en' => 'Scheduled', 'bn' => 'নির্ধারিত'],
            'detail.timeline.completed' => ['en' => 'Completed', 'bn' => 'সম্পন্ন'],
        ];
    }

    // ── orders ────────────────────────────────────────────────────

    private function orders(): array
    {
        return [
            // Page level
            'title' => ['en' => 'My Orders', 'bn' => 'আমার অর্ডার'],
            'subtitle' => ['en' => 'Track your service orders and payments', 'bn' => 'আপনার সেবা অর্ডার ও পেমেন্ট ট্র্যাক করুন'],
            'couldNotLoad' => ['en' => 'Could not load orders', 'bn' => 'অর্ডার লোড করা যায়নি'],
            'loadingOrders' => ['en' => 'Loading orders...', 'bn' => 'অর্ডার লোড হচ্ছে...'],
            'refreshing' => ['en' => 'Refreshing...', 'bn' => 'রিফ্রেশ হচ্ছে...'],
            'addServices' => ['en' => 'Add Services', 'bn' => 'সেবা যোগ করুন'],
            'browseServices' => ['en' => 'Browse Services', 'bn' => 'সেবা দেখুন'],
            'viewOrder' => ['en' => 'View Order', 'bn' => 'অর্ডার দেখুন'],

            // Fields
            'fields.date' => ['en' => 'Date', 'bn' => 'তারিখ'],
            'fields.status' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'fields.total' => ['en' => 'Total', 'bn' => 'মোট'],

            // Empty state
            'empty.title' => ['en' => 'No orders yet', 'bn' => 'এখনও কোনো অর্ডার নেই'],
            'empty.description' => ['en' => 'Browse our services to get started', 'bn' => 'শুরু করতে আমাদের সেবা দেখুন'],

            // Detail page
            'detail.loading' => ['en' => 'Loading order...', 'bn' => 'অর্ডার লোড হচ্ছে...'],
            'detail.notFound' => ['en' => 'Order not found', 'bn' => 'অর্ডার পাওয়া যায়নি'],
            'detail.backToOrders' => ['en' => 'Back to Orders', 'bn' => 'অর্ডারে ফিরুন'],
            'detail.status' => ['en' => 'Status', 'bn' => 'স্থিতি'],
            'detail.total' => ['en' => 'Total', 'bn' => 'মোট'],
            'detail.created' => ['en' => 'Created', 'bn' => 'তৈরি'],
            'detail.items' => ['en' => 'Items', 'bn' => 'আইটেম'],
            'detail.payWithStripe' => ['en' => 'Pay with Stripe', 'bn' => 'Stripe দিয়ে পেমেন্ট করুন'],
            'detail.redirecting' => ['en' => 'Redirecting...', 'bn' => 'পুনর্নির্দেশিত হচ্ছে...'],
            'detail.viewConfirmation' => ['en' => 'View Confirmation', 'bn' => 'নিশ্চিতকরণ দেখুন'],
            'detail.cancelOrder' => ['en' => 'Cancel Order', 'bn' => 'অর্ডার বাতিল করুন'],
            'detail.cancelling' => ['en' => 'Cancelling...', 'bn' => 'বাতিল হচ্ছে...'],

            // Confirmation page
            'confirmation.loading' => ['en' => 'Loading confirmation...', 'bn' => 'নিশ্চিতকরণ লোড হচ্ছে...'],
            'confirmation.paymentStatus' => ['en' => 'Payment Status', 'bn' => 'পেমেন্টের স্থিতি'],
            'confirmation.paymentConfirmed' => ['en' => 'Payment Confirmed', 'bn' => 'পেমেন্ট নিশ্চিত'],
            'confirmation.paymentReceived' => ['en' => 'Your payment has been received', 'bn' => 'আপনার পেমেন্ট গ্রহণ করা হয়েছে'],
            'confirmation.paymentProcessing' => ['en' => 'Payment Processing', 'bn' => 'পেমেন্ট প্রক্রিয়াধীন'],
            'confirmation.waitingForPayment' => ['en' => 'Waiting for payment', 'bn' => 'পেমেন্টের অপেক্ষায়'],
            'confirmation.orderLabel' => ['en' => 'Order', 'bn' => 'অর্ডার'],
            'confirmation.bookMoreServices' => ['en' => 'Book More Services', 'bn' => 'আরো সেবা বুক করুন'],
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
