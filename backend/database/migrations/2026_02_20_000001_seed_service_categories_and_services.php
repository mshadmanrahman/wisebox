<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Service Categories
        $categories = [
            ['name' => 'Property Verification', 'slug' => 'property-verification', 'description' => 'Land and apartment title verification, document validation, and field inspection services', 'icon' => 'heroicon-o-shield-check', 'sort_order' => 1],
            ['name' => 'Land Registration', 'slug' => 'land-registration', 'description' => 'Land registration assistance for NRB (international) and national Bangladeshi citizens', 'icon' => 'heroicon-o-document-text', 'sort_order' => 2],
            ['name' => 'Document Services', 'slug' => 'document-services', 'description' => 'Record collection, deed searching, mutation, map retrieval, and porcha verification', 'icon' => 'heroicon-o-folder-open', 'sort_order' => 3],
            ['name' => 'Legal & Dispute', 'slug' => 'legal-dispute', 'description' => 'Land dispute resolution, appeal cases, misc cases, and legal analysis', 'icon' => 'heroicon-o-scale', 'sort_order' => 4],
            ['name' => 'Consultation', 'slug' => 'consultation', 'description' => 'Expert consultation for property-related questions and problem identification', 'icon' => 'heroicon-o-chat-bubble-left-right', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            $cat['is_active'] = true;
            $cat['created_at'] = now();
            $cat['updated_at'] = now();
            DB::table('service_categories')->updateOrInsert(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        // Fetch category IDs
        $catIds = DB::table('service_categories')->pluck('id', 'slug')->toArray();

        // Services (from Wisebox List of Services PDF + Land Service Fee Chart)
        $services = [
            // Property Verification
            [
                'category_id' => $catIds['property-verification'],
                'name' => 'Land Purchase Verification',
                'slug' => 'land-purchase-verification',
                'short_description' => 'Full title verification for land purchase: khatian, deed, mutation, DCR, tax, map, and field inspection',
                'description' => "Comprehensive land title verification before purchase. Includes:\n- Recorded Khatian Collection (CS/SA/RS/BS/BRS/BDS)\n- Deed & Via Deed verification\n- Mutation Khatian verification\n- Duplicate Carbon Receipt (DCR)\n- Land Development Tax / Dakhila verification\n- Map / Noksha / Pentagraph\n- Possession & Position field verification\n- Holding & Porcha verification (DC Office, AC Land Office, Union Land Office, Settlement Office)",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => false,
                'is_featured' => true,
                'sort_order' => 1,
            ],
            [
                'category_id' => $catIds['property-verification'],
                'name' => 'Apartment Purchase Verification',
                'slug' => 'apartment-purchase-verification',
                'short_description' => 'Full title verification for apartment purchase: land title, developer credentials, RAJUK approval, and utilities',
                'description' => "Comprehensive apartment title verification before purchase. Includes all land verification items plus:\n- Power of Attorney between land owner and developer\n- Floor/Apartment distribution agreement\n- Building Plan Approval from RAJUK\n- Utility connection permits (gas, electricity, WASA, sewerage)\n- Building Construction Permit\n- Fire Service NOC\n- Car parking allocation documents",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => false,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'category_id' => $catIds['property-verification'],
                'name' => 'Land Sale Verification',
                'slug' => 'land-sale-verification',
                'short_description' => 'Title verification and documentation for land sale transactions',
                'description' => "Complete verification for selling land. Includes khatian collection, deed verification, mutation, DCR, LD tax, map, field verification, and holding/porcha verification across all relevant offices.",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => false,
                'sort_order' => 3,
            ],
            [
                'category_id' => $catIds['property-verification'],
                'name' => 'Apartment Sale Verification',
                'slug' => 'apartment-sale-verification',
                'short_description' => 'Title verification and documentation for apartment sale transactions',
                'description' => "Complete verification for selling an apartment. Includes all land verification items plus developer agreement verification, RAJUK approval, utility permits, fire NOC, and parking allocation.",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => false,
                'sort_order' => 4,
            ],

            // Land Registration
            [
                'category_id' => $catIds['land-registration'],
                'name' => 'Land Registration (NRB / International)',
                'slug' => 'land-registration-nrb',
                'short_description' => 'Land registration assistance for Non-Resident Bangladeshis',
                'description' => "Land registration service for NRB (Non-Resident Bangladeshi) clients. Required documents:\n- Birth Certificate\n- National Identification Number (mandatory)\n- Bangladeshi Passport\n- Inheritance Certificate\n- Land-related documents of forefathers\n- Photo",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'category_id' => $catIds['land-registration'],
                'name' => 'Land Registration (National)',
                'slug' => 'land-registration-national',
                'short_description' => 'Land registration assistance for Bangladeshi citizens',
                'description' => "Land registration service for Bangladeshi nationals. Required documents:\n- Birth Certificate\n- National Identification Number (mandatory)\n- Bangladeshi Passport\n- Inheritance Certificate\n- Land-related documents of forefathers\n- Photo",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => null,
                'requires_meeting' => true,
                'sort_order' => 6,
            ],

            // Document Services
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Ownership Transfer (Namjari / Mutation)',
                'slug' => 'ownership-transfer-mutation',
                'short_description' => 'Mutation / Namjari application for ownership transfer',
                'description' => "Complete ownership transfer (Namjari) service. Government fees: Application 70 BDT, Court Fee 20 BDT, Notice Issuance 50 BDT, DCR 1,100 BDT (total ~1,170 BDT). Service cost: 30,000-50,000 BDT per Khatian.",
                'pricing_type' => 'paid',
                'price' => 30000.00,
                'currency' => 'BDT',
                'sort_order' => 7,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Khatian / Record of Rights (ROR) Copy',
                'slug' => 'khatian-ror-copy',
                'short_description' => 'Obtain certified khatian or porcha copies from government offices',
                'description' => "Retrieve Khatian / Record of Rights copies. Options:\n- Online (e-Porcha): 100 BDT\n- Certified Copy (DC Office): 100 BDT\n- DC Office Counter (direct application): 100 BDT\n- By Post: 140 BDT",
                'pricing_type' => 'paid',
                'price' => 500.00,
                'currency' => 'BDT',
                'sort_order' => 8,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Land Survey / Map Measurement',
                'slug' => 'land-survey-map',
                'short_description' => 'Land survey, map retrieval, noksha, and pentagraph services',
                'description' => "Land survey and map measurement service. Government fees: Office Counter Court Fee 5 BDT, Court Fee 20 BDT, Map Fee 500 BDT (total ~525 BDT at office). Online application: 520 BDT. By post: 110 BDT.",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'sort_order' => 9,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Deed / Baiya Searching',
                'slug' => 'deed-searching',
                'short_description' => 'Deed, Baiya, and Pre-Deed searching in registration office',
                'description' => 'Search for deeds, Baiya documents, and pre-deeds at the Sub Registry Office and District Register Office.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 10,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Porcha Searching',
                'slug' => 'porcha-searching',
                'short_description' => 'Porcha searching in Settlement Office',
                'description' => 'Search and retrieve porcha documents from the Settlement Office.',
                'pricing_type' => 'paid',
                'price' => 500.00,
                'currency' => 'BDT',
                'sort_order' => 11,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Map & Khatian Searching (DC Record Room)',
                'slug' => 'map-khatian-dc-search',
                'short_description' => 'Map and Khatian searching in DC record room',
                'description' => 'Search and retrieve maps and khatian records from the Deputy Commissioner (DC) Office Record Room.',
                'pricing_type' => 'paid',
                'price' => 500.00,
                'currency' => 'BDT',
                'sort_order' => 12,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Land Ownership Papers',
                'slug' => 'land-ownership-papers',
                'short_description' => 'Mutation, Land Development Tax, and Record collection',
                'description' => "Collect and verify land ownership related papers:\n- Mutation documents\n- Land Development Tax records\n- Official land records",
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 13,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Patta Issuance',
                'slug' => 'patta-issuance',
                'short_description' => 'Patta issuance service',
                'description' => 'Assist with patta issuance process. Approximate cost: 6,000-10,000 BDT per Patta.',
                'pricing_type' => 'paid',
                'price' => 6000.00,
                'currency' => 'BDT',
                'sort_order' => 14,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Digital Land Service / Online Service',
                'slug' => 'digital-land-service',
                'short_description' => 'Online land service applications via land.gov.bd',
                'description' => 'Digital land service operations through land.gov.bd portal. Approximate cost: 500-2,000 BDT per service.',
                'pricing_type' => 'paid',
                'price' => 500.00,
                'currency' => 'BDT',
                'sort_order' => 15,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Legal Document / Deed Fee',
                'slug' => 'legal-document-deed-fee',
                'short_description' => 'Legal document preparation and deed fee services',
                'description' => 'Preparation and processing of legal documents and deeds. Approximate cost: 5,000-10,000 BDT per document.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 16,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Power of Attorney',
                'slug' => 'power-of-attorney',
                'short_description' => 'Power of Attorney deed preparation and registration',
                'description' => 'Prepare and register Power of Attorney deeds for property transactions.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 17,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Baynama Dolil',
                'slug' => 'baynama-dolil',
                'short_description' => 'Baynama Dolil (Sale Deed) preparation',
                'description' => 'Prepare Baynama Dolil (Sale Deed) for property transactions.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 18,
            ],
            [
                'category_id' => $catIds['document-services'],
                'name' => 'Deed Document Recovery (Lost)',
                'slug' => 'deed-document-lost',
                'short_description' => 'Recovery and replacement of lost deed documents',
                'description' => 'Assist with the process of recovering or replacing lost deed documents from relevant offices.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 19,
            ],

            // Legal & Dispute
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Deed / Dispute Resolution',
                'slug' => 'deed-dispute-resolution',
                'short_description' => 'Land dispute resolution and deed-related cases',
                'description' => 'Handle land disputes, deed conflicts, and related legal matters. Cost: 5,000-50,000 BDT depending on case type.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 20,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Misc Case (AC Land Office)',
                'slug' => 'misc-case-ac-land',
                'short_description' => 'File miscellaneous cases at AC Land Office',
                'description' => 'File and manage miscellaneous land cases at the Assistant Commissioner (Land) Office.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 21,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Appeal Case (ADC Revenue / Land Appeal Board)',
                'slug' => 'appeal-case-adc',
                'short_description' => 'Appeal cases to ADC Revenue, Additional Commissioner, or Land Appeal Board',
                'description' => 'File and manage appeal cases to the Additional Deputy Commissioner (Revenue), Additional Commissioner, or the Land Appeal Board.',
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 22,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Mutation Review / Application Review',
                'slug' => 'mutation-review',
                'short_description' => 'Mutation review and clerical mistake correction',
                'description' => "Review and correct mutation applications. Government fee for Mutation Review Application: 70 BDT. Clerical Mistake Correction (Namjari/Porcha Koranik Bhul Sansodhon): 70 BDT + DCR 1,100 BDT + Porcha 20 BDT. Miscase fee: 20 BDT (Office Application + Court Fee).",
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 23,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Land Regularization / Clearance',
                'slug' => 'land-regularization',
                'short_description' => 'Land regularization and clearance services',
                'description' => 'Land regularization and clearance process. Cost: 10,000-50,000 BDT depending on land size.',
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 24,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Inheritance Property Analysis',
                'slug' => 'inheritance-property',
                'short_description' => 'Inheritance property analysis based on applicable religious law',
                'description' => 'Analyze inheritance property rights and distribution based on applicable religious law (Muslim, Hindu, Christian, Buddhist succession laws).',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 25,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Special Property Analysis',
                'slug' => 'special-property-analysis',
                'short_description' => 'Analysis of Waqf, Vested, Abandoned, Mortgage, and Khas land',
                'description' => "Specialized property analysis for complex land types:\n- Waqf land analysis\n- Vested Property\n- Abandoned Property\n- Mortgage Property\n- Khas Land\n- Government Land Lease / Allocation (cost: 2,000,000-5,000,000 BDT based on land type/size)",
                'pricing_type' => 'paid',
                'price' => 10000.00,
                'currency' => 'BDT',
                'requires_meeting' => true,
                'sort_order' => 26,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'History Analysis (Khatian & Deed)',
                'slug' => 'history-analysis-khatian-deed',
                'short_description' => 'Historical chain analysis of Khatian records and Deed documents',
                'description' => 'Trace the complete ownership history through Khatian records (CS, SA, RS, BS, BRS, BDS) and deed chain to verify legitimate title succession.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'sort_order' => 27,
            ],
            [
                'category_id' => $catIds['legal-dispute'],
                'name' => 'Property Tax / Assessment',
                'slug' => 'property-tax-assessment',
                'short_description' => 'Property tax assessment and valuation',
                'description' => 'Property tax assessment and valuation services. Cost: 1,000-500,000 BDT based on property value.',
                'pricing_type' => 'paid',
                'price' => 1000.00,
                'currency' => 'BDT',
                'sort_order' => 28,
            ],

            // Consultation
            [
                'category_id' => $catIds['consultation'],
                'name' => 'Free Consultation',
                'slug' => 'free-consultation',
                'short_description' => 'Free initial consultation to discuss your property question',
                'description' => 'A free 30-minute consultation to discuss your property-related question, understand your situation, and recommend next steps.',
                'pricing_type' => 'free',
                'price' => 0.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => 30,
                'requires_meeting' => true,
                'is_featured' => true,
                'sort_order' => 29,
            ],
            [
                'category_id' => $catIds['consultation'],
                'name' => 'Expert Consultation',
                'slug' => 'expert-consultation',
                'short_description' => 'Paid expert consultation for complex property matters',
                'description' => 'In-depth consultation with a property expert for complex matters including dispute resolution strategy, multi-party ownership, and cross-border property management.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => 60,
                'requires_meeting' => true,
                'is_featured' => true,
                'sort_order' => 30,
            ],
            [
                'category_id' => $catIds['consultation'],
                'name' => 'Land Problem Identification & Solutions',
                'slug' => 'land-problem-identification',
                'short_description' => 'Identify land-related problems and provide solutions',
                'description' => 'Comprehensive assessment of land-related problems with recommended solutions and action plan.',
                'pricing_type' => 'paid',
                'price' => 5000.00,
                'currency' => 'BDT',
                'estimated_duration_minutes' => 60,
                'requires_meeting' => true,
                'sort_order' => 31,
            ],
        ];

        foreach ($services as $svc) {
            $svc['is_active'] = $svc['is_active'] ?? true;
            $svc['is_featured'] = $svc['is_featured'] ?? false;
            $svc['requires_meeting'] = $svc['requires_meeting'] ?? false;
            $svc['created_at'] = now();
            $svc['updated_at'] = now();

            DB::table('services')->updateOrInsert(
                ['slug' => $svc['slug']],
                $svc
            );
        }
    }

    public function down(): void
    {
        $slugs = [
            'land-purchase-verification', 'apartment-purchase-verification',
            'land-sale-verification', 'apartment-sale-verification',
            'land-registration-nrb', 'land-registration-national',
            'ownership-transfer-mutation', 'khatian-ror-copy', 'land-survey-map',
            'deed-searching', 'porcha-searching', 'map-khatian-dc-search',
            'land-ownership-papers', 'patta-issuance', 'digital-land-service',
            'legal-document-deed-fee', 'power-of-attorney', 'baynama-dolil',
            'deed-document-lost', 'deed-dispute-resolution', 'misc-case-ac-land',
            'appeal-case-adc', 'mutation-review', 'land-regularization',
            'inheritance-property', 'special-property-analysis',
            'history-analysis-khatian-deed', 'property-tax-assessment',
            'free-consultation', 'expert-consultation', 'land-problem-identification',
        ];

        DB::table('services')->whereIn('slug', $slugs)->delete();

        $catSlugs = [
            'property-verification', 'land-registration', 'document-services',
            'legal-dispute', 'consultation',
        ];

        DB::table('service_categories')->whereIn('slug', $catSlugs)->delete();
    }
};
