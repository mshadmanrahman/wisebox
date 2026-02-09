<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            // PRIMARY SCORED DOCUMENTS (total weight: 100 points)
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
            // CONDITIONAL DOCUMENTS (not scored, shown based on ownership status)
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
            // ADDITIONAL
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

        foreach ($types as $type) {
            DB::table('document_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
