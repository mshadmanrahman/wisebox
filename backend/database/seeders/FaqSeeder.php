<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
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
            DB::table('faqs')->insert(array_merge($faq, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
