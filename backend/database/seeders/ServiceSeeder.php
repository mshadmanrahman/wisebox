<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // Create default category
        $categoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Property Services',
            'slug' => 'property-services',
            'description' => 'Core property management and verification services',
            'icon' => 'building',
            'is_active' => true,
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $legalCategoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Legal Services',
            'slug' => 'legal-services',
            'description' => 'Legal documentation and transfer services',
            'icon' => 'scale',
            'is_active' => true,
            'sort_order' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $financialCategoryId = DB::table('service_categories')->insertGetId([
            'name' => 'Financial Services',
            'slug' => 'financial-services',
            'description' => 'Tax, valuation, and financial services',
            'icon' => 'wallet',
            'is_active' => true,
            'sort_order' => 3,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $services = [
            // Property Services
            ['category_id' => $categoryId, 'name' => 'Deed & Ownership Verification', 'slug' => 'deed-ownership-verification', 'short_description' => 'Verify the authenticity and validity of your property deed', 'pricing_type' => 'paid', 'price' => 45.00, 'estimated_duration_minutes' => 90, 'requires_meeting' => true, 'is_featured' => true, 'sort_order' => 1],
            ['category_id' => $categoryId, 'name' => 'Property Background Check', 'slug' => 'property-background-check', 'short_description' => 'Comprehensive background check on property history and disputes', 'pricing_type' => 'paid', 'price' => 60.00, 'estimated_duration_minutes' => 120, 'requires_meeting' => true, 'is_featured' => true, 'sort_order' => 2],
            ['category_id' => $categoryId, 'name' => 'Market Value Assessment', 'slug' => 'market-value-assessment', 'short_description' => 'Get a current market valuation of your property', 'pricing_type' => 'paid', 'price' => 50.00, 'estimated_duration_minutes' => 120, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 9],
            ['category_id' => $categoryId, 'name' => 'Construction Cost Estimation', 'slug' => 'construction-cost-estimation', 'short_description' => 'Estimate construction or renovation costs for your property', 'pricing_type' => 'paid', 'price' => 65.00, 'estimated_duration_minutes' => 150, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 10],
            ['category_id' => $categoryId, 'name' => 'Utility Bill Verification', 'slug' => 'utility-bill-verification', 'short_description' => 'Verify utility connections and outstanding bills', 'pricing_type' => 'free', 'price' => 0.00, 'estimated_duration_minutes' => 45, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 8],

            // Legal Services
            ['category_id' => $legalCategoryId, 'name' => 'Deed Transfer Processing', 'slug' => 'deed-transfer-processing', 'short_description' => 'Complete deed transfer from seller to buyer with legal support', 'pricing_type' => 'physical', 'price' => 120.00, 'estimated_duration_minutes' => 180, 'requires_meeting' => true, 'is_featured' => true, 'sort_order' => 3],
            ['category_id' => $legalCategoryId, 'name' => 'Power of Attorney Transfer', 'slug' => 'power-of-attorney-transfer', 'short_description' => 'Set up or transfer power of attorney for property management', 'pricing_type' => 'paid', 'price' => 95.00, 'estimated_duration_minutes' => 135, 'requires_meeting' => true, 'is_featured' => false, 'sort_order' => 4],
            ['category_id' => $legalCategoryId, 'name' => 'Mutation Application Assistance', 'slug' => 'mutation-application', 'short_description' => 'Help with applying for mutation (Namjari) at the land office', 'pricing_type' => 'paid', 'price' => 40.00, 'estimated_duration_minutes' => 120, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 5],
            ['category_id' => $legalCategoryId, 'name' => 'Khatian Record Update', 'slug' => 'khatian-record-update', 'short_description' => 'Update your Khatian record with the government', 'pricing_type' => 'paid', 'price' => 55.00, 'estimated_duration_minutes' => 150, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 6],
            ['category_id' => $legalCategoryId, 'name' => 'Lease Agreement Preparation', 'slug' => 'lease-agreement-preparation', 'short_description' => 'Draft and review lease agreements for your property', 'pricing_type' => 'paid', 'price' => 30.00, 'estimated_duration_minutes' => 60, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 11],

            // Financial Services
            ['category_id' => $financialCategoryId, 'name' => 'Land Tax Payment Assistance', 'slug' => 'land-tax-payment', 'short_description' => 'Help with calculating and paying your land development tax', 'pricing_type' => 'paid', 'price' => 20.00, 'estimated_duration_minutes' => 60, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 7],
            ['category_id' => $financialCategoryId, 'name' => 'Secure Document Storage', 'slug' => 'secure-document-storage', 'short_description' => 'Encrypted cloud storage for your property documents', 'pricing_type' => 'paid', 'price' => 40.00, 'estimated_duration_minutes' => null, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 12],

            // Additional services (from backend audit page 2)
            ['category_id' => $categoryId, 'name' => 'Property Inspection', 'slug' => 'property-inspection', 'short_description' => 'On-ground physical inspection of your property', 'pricing_type' => 'physical', 'price' => 80.00, 'estimated_duration_minutes' => 240, 'requires_meeting' => true, 'is_featured' => false, 'sort_order' => 13],
            ['category_id' => $legalCategoryId, 'name' => 'Boundary Dispute Resolution', 'slug' => 'boundary-dispute-resolution', 'short_description' => 'Expert mediation for property boundary disputes', 'pricing_type' => 'paid', 'price' => 75.00, 'estimated_duration_minutes' => 180, 'requires_meeting' => true, 'is_featured' => false, 'sort_order' => 14],
            ['category_id' => $categoryId, 'name' => 'Property Valuation Report', 'slug' => 'property-valuation-report', 'short_description' => 'Detailed property valuation report for financial purposes', 'pricing_type' => 'paid', 'price' => 90.00, 'estimated_duration_minutes' => 180, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 15],
            ['category_id' => $legalCategoryId, 'name' => 'Land Use Certificate', 'slug' => 'land-use-certificate', 'short_description' => 'Obtain land use clearance certificate from authorities', 'pricing_type' => 'paid', 'price' => 35.00, 'estimated_duration_minutes' => 90, 'requires_meeting' => false, 'is_featured' => false, 'sort_order' => 16],
            ['category_id' => $categoryId, 'name' => 'General Consultation', 'slug' => 'general-consultation', 'short_description' => 'One-on-one expert consultation on any property matter', 'pricing_type' => 'free', 'price' => 0.00, 'estimated_duration_minutes' => 30, 'requires_meeting' => true, 'is_featured' => true, 'sort_order' => 17],
        ];

        foreach ($services as $service) {
            DB::table('services')->updateOrInsert(
                ['slug' => $service['slug']],
                array_merge($service, [
                    'currency' => 'USD',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
