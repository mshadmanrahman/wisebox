<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed remaining reference data missed by earlier migrations.
 * Covers: ownership type "co-ownership", FAQs, and updated document types.
 * Idempotent via updateOrInsert on slug/question.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        // --- Missing Ownership Type: Co-Ownership without Partition ---
        DB::table('ownership_types')->updateOrInsert(
            ['slug' => 'co_ownership'],
            [
                'name' => 'Co-Ownership without Partition',
                'slug' => 'co_ownership',
                'description' => 'Shared but undivided ownership, common in family property',
                'requires_co_owners' => true,
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // --- FAQs (8 entries, never had a seed migration) ---
        $faqs = [
            [
                'question' => 'What is Wisebox?',
                'answer' => 'Wisebox is a digital property management platform designed for the South Asian diaspora. We help NRBs (Non-Resident Bangladeshis), NRIs, and NRPs manage their ancestral properties, verify documents, and connect with legal experts from anywhere in the world.',
                'category' => 'general',
                'sort_order' => 1,
            ],
            [
                'question' => 'How does the free property assessment work?',
                'answer' => 'Our free assessment asks you 10-15 simple yes/no questions about your property documents and ownership status. Based on your answers, we calculate a completion score (green/yellow/red) and identify gaps in your documentation. No account required.',
                'category' => 'general',
                'sort_order' => 2,
            ],
            [
                'question' => 'What documents do I need to upload?',
                'answer' => 'The key documents are: Deed (Dolil), Recorded Khatian (RS/BS/CS), Mutation Khatian, Land Tax Receipt (Dakhila), and Position/Possession of Land. We guide you through what each document is and what to do if you don\'t have it.',
                'category' => 'documents',
                'sort_order' => 3,
            ],
            [
                'question' => 'Are my documents secure?',
                'answer' => 'Yes. All documents are encrypted and stored on AWS S3 with server-side encryption. Access is controlled through temporary signed URLs that expire after 15 minutes. Only you and your assigned consultant can view your documents.',
                'category' => 'security',
                'sort_order' => 4,
            ],
            [
                'question' => 'Who are the consultants?',
                'answer' => 'Our consultant network includes retired government land officials, licensed lawyers specializing in property law, and on-ground agents familiar with local land offices. All consultants are vetted before joining the platform.',
                'category' => 'services',
                'sort_order' => 5,
            ],
            [
                'question' => 'How much do services cost?',
                'answer' => 'We offer free services like Utility Bill Verification and General Consultation. Paid services range from $20 (Land Tax Assistance) to $120 (Deed Transfer Processing). You only pay for services you need.',
                'category' => 'pricing',
                'sort_order' => 6,
            ],
            [
                'question' => 'Can I manage multiple properties?',
                'answer' => 'Yes. You can add and manage as many properties as you need. Each property has its own document set, completion score, and service history.',
                'category' => 'general',
                'sort_order' => 7,
            ],
            [
                'question' => 'What is the completion score?',
                'answer' => 'The completion score (0-100) measures how complete your property documentation is. Green (80+) means well-documented, Yellow (40-79) means partially documented, Red (below 40) means critical gaps. The score helps you prioritize what documents to obtain.',
                'category' => 'general',
                'sort_order' => 8,
            ],
        ];

        foreach ($faqs as $faq) {
            DB::table('faqs')->updateOrInsert(
                ['question' => $faq['question']],
                array_merge($faq, [
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }

        // --- Updated Document Types from seeder (different slugs/weights than Feb 19 migration) ---
        $documentTypes = [
            [
                'name' => 'Possession & Position of the Land',
                'slug' => 'position_of_land',
                'description' => 'Exact physical location, boundaries, and actual physical control/use of the property',
                'category' => 'primary',
                'is_required' => true,
                'guidance_text' => 'This document proves your physical possession and the exact boundaries of your property. It is the most important document for property verification.',
                'missing_guidance' => 'Contact a local surveyor or the Union Land Office to get a current position/possession certificate. This is critical for property verification.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 40,
                'conditional_on_ownership' => null,
                'sort_order' => 1,
            ],
            [
                'name' => 'Recorded Khatian (RS/BS/CS/BRS/BDS)',
                'slug' => 'recorded_khatian',
                'description' => 'Official government land record (Record of Rights)',
                'category' => 'primary',
                'is_required' => true,
                'guidance_text' => 'The Khatian is the official government record showing who owns what land. Different surveys have different names: RS (Revisional Survey), BS (Bangladesh Survey), CS (Cadastral Survey), BRS, BDS.',
                'missing_guidance' => 'Visit the AC Land office or use the government e-porcha service to obtain a copy of your Khatian.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 20,
                'conditional_on_ownership' => null,
                'sort_order' => 2,
            ],
            [
                'name' => 'Deed (Dolil)',
                'slug' => 'deed',
                'description' => 'The primary legal document proving ownership',
                'category' => 'primary',
                'is_required' => true,
                'guidance_text' => 'The Deed (Dolil) is the legal document that proves ownership transfer. It should be registered at the Sub-Registry Office.',
                'missing_guidance' => 'If you have lost your deed, contact the Sub-Registry Office where it was originally registered to obtain a certified copy.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 15,
                'conditional_on_ownership' => null,
                'sort_order' => 3,
            ],
            [
                'name' => 'Mutation Khatian',
                'slug' => 'mutation_khatian',
                'description' => 'Record of ownership transfer in government records',
                'category' => 'primary',
                'is_required' => true,
                'guidance_text' => 'Mutation (Namjari) is the process of transferring the land record from the previous owner to the new owner in government records.',
                'missing_guidance' => 'Apply for mutation at the AC Land office. You will need your deed and the previous owner\'s Khatian.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 10,
                'conditional_on_ownership' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'LD Tax / Dakhila / Rent Receipt (RR)',
                'slug' => 'ld_tax',
                'description' => 'Proof of land development tax payment',
                'category' => 'primary',
                'is_required' => false,
                'guidance_text' => 'The Land Development Tax receipt (Dakhila/Khazna) proves you have been paying taxes on this property, which strengthens your ownership claim.',
                'missing_guidance' => 'Pay your land tax at the Union Land Office or through the government online portal to obtain a current receipt.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 5,
                'conditional_on_ownership' => null,
                'sort_order' => 5,
            ],
            [
                'name' => 'Duplicate Carbon Receipt (DCR)',
                'slug' => 'dcr',
                'description' => 'Official duplicate of a lost land registration receipt',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'The DCR is a duplicate receipt issued by the registration office, useful when original registration receipts are lost.',
                'missing_guidance' => 'Apply at the Sub-Registry Office where the deed was registered to obtain a DCR.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 5,
                'conditional_on_ownership' => null,
                'sort_order' => 6,
            ],
            [
                'name' => 'Map / Noksha / Pentagraph',
                'slug' => 'map_noksha',
                'description' => 'Survey map showing property boundaries',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'A survey map (Noksha/Pentagraph) shows the exact boundaries and measurements of your property as recorded by government surveyors.',
                'missing_guidance' => 'Request a copy from the local land survey office or AC Land office.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 5,
                'conditional_on_ownership' => null,
                'sort_order' => 7,
            ],
            [
                'name' => 'Court Order / Decree',
                'slug' => 'court_order',
                'description' => 'Legal court order or decree proving ownership',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'Upload the court order or decree that grants you ownership of this property.',
                'missing_guidance' => 'Contact the court where the decree was issued to obtain a certified copy.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 0,
                'conditional_on_ownership' => 'court_decree',
                'sort_order' => 8,
            ],
            [
                'name' => 'Settlement / Lease Gazettes',
                'slug' => 'settlement_gazette',
                'description' => 'Official government notifications granting land',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'Upload the settlement or lease gazette that grants you rights to this property.',
                'missing_guidance' => 'Contact the DC office or the relevant settlement authority.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 0,
                'conditional_on_ownership' => 'settlement',
                'sort_order' => 9,
            ],
            [
                'name' => 'Succession Certificate',
                'slug' => 'succession_certificate',
                'description' => 'Certificate proving inheritance rights',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'Upload the succession certificate or inheritance documents proving your right to this property.',
                'missing_guidance' => 'Apply for a succession certificate at the local court. You will need death certificate of the previous owner and proof of relationship.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 0,
                'conditional_on_ownership' => 'inheritance',
                'sort_order' => 10,
            ],
            [
                'name' => 'Via Deed',
                'slug' => 'via_deed',
                'description' => 'Historical deed showing chain of ownership',
                'category' => 'secondary',
                'is_required' => false,
                'guidance_text' => 'A Via Deed (Baya Dolil) shows the chain of ownership before the current deed, proving the seller had the right to sell.',
                'missing_guidance' => 'Check with the Sub-Registry Office for historical deeds in the chain of ownership.',
                'accepted_formats' => json_encode(['pdf', 'jpg', 'png', 'jpeg']),
                'max_file_size_mb' => 10,
                'score_weight' => 0,
                'conditional_on_ownership' => null,
                'sort_order' => 11,
            ],
        ];

        foreach ($documentTypes as $type) {
            DB::table('document_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, [
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }

    public function down(): void
    {
        DB::table('faqs')->whereIn('question', [
            'What is Wisebox?',
            'How does the free property assessment work?',
            'What documents do I need to upload?',
            'Are my documents secure?',
            'Who are the consultants?',
            'How much do services cost?',
            'Can I manage multiple properties?',
            'What is the completion score?',
        ])->delete();

        DB::table('ownership_types')->where('slug', 'co_ownership')->delete();

        DB::table('document_types')->whereIn('slug', [
            'position_of_land', 'recorded_khatian', 'deed', 'mutation_khatian',
            'ld_tax', 'dcr', 'map_noksha', 'court_order', 'settlement_gazette',
            'succession_certificate', 'via_deed',
        ])->delete();
    }
};
