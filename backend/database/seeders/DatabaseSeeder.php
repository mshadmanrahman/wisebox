<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Reference data (no dependencies)
            PropertyTypeSeeder::class,
            OwnershipStatusSeeder::class,
            OwnershipTypeSeeder::class,
            DocumentTypeSeeder::class,
            AssessmentQuestionSeeder::class,

            // Location data
            LocationSeeder::class,

            // Services
            ServiceSeeder::class,

            // Content
            FaqSeeder::class,

            // Consultation form templates (depends on services)
            ConsultationFormTemplateSeeder::class,

            // Local admin access
            AdminUserSeeder::class,

            // E2E test users (customer, consultant, admin with test passwords)
            TestUserSeeder::class,

            // i18n: Frontend translation strings (EN + BN)
            TranslationSeeder::class,
        ]);
    }
}
