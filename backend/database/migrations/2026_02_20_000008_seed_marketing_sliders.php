<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('sliders')->insert([
            [
                'title' => 'Get Land Related Service Online',
                'subtitle' => 'Learn more about our services',
                'image_path' => '',
                'image_alt' => null,
                'cta_text' => 'Learn More',
                'cta_url' => '/workspace/services',
                'background_color' => 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                'is_active' => true,
                'sort_order' => 1,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => "Don't have all your papers in place?",
                'subtitle' => 'Learn how to get the right documents instantly.',
                'image_path' => '',
                'image_alt' => null,
                'cta_text' => 'See How',
                'cta_url' => '/workspace/services',
                'background_color' => 'linear-gradient(135deg, #0f766e, #14b8a6)',
                'is_active' => true,
                'sort_order' => 2,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Protect your property from anywhere',
                'subtitle' => 'Digital property management for Bangladeshi diaspora',
                'image_path' => '',
                'image_alt' => null,
                'cta_text' => 'Add Property',
                'cta_url' => '/properties/new',
                'background_color' => 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                'is_active' => true,
                'sort_order' => 3,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Free Property Assessment',
                'subtitle' => 'Get a comprehensive risk score in 5 minutes',
                'image_path' => '',
                'image_alt' => null,
                'cta_text' => 'Start Now',
                'cta_url' => '/assessment/start',
                'background_color' => 'linear-gradient(135deg, #c2410c, #f97316)',
                'is_active' => true,
                'sort_order' => 4,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('sliders')->whereIn('title', [
            'Get Land Related Service Online',
            "Don't have all your papers in place?",
            'Protect your property from anywhere',
            'Free Property Assessment',
        ])->delete();
    }
};
