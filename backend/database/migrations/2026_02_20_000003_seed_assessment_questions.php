<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed assessment questions via migration (Railpacks runs migrate --force but NOT db:seed).
 * Mirrors AssessmentQuestionSeeder data. Idempotent via updateOrInsert.
 */
return new class extends Migration
{
    public function up(): void
    {
        $questions = [
            ['id' => 1, 'question' => 'Do you have the original property deed (Dolil)?', 'weight' => 15, 'doc_type' => 'deed'],
            ['id' => 2, 'question' => 'Is the deed registered in your name?', 'weight' => 10, 'doc_type' => null],
            ['id' => 3, 'question' => 'Do you have a certified copy of the deed?', 'weight' => 5, 'doc_type' => null],
            ['id' => 4, 'question' => 'Do you have your latest land tax receipt (Dakhila)?', 'weight' => 15, 'doc_type' => 'ld_tax'],
            ['id' => 5, 'question' => 'Is the mutation (Namjari) completed in your name?', 'weight' => 15, 'doc_type' => 'mutation_khatian'],
            ['id' => 6, 'question' => 'Do you have the Recorded Khatian (RS/BS/CS)?', 'weight' => 15, 'doc_type' => 'recorded_khatian'],
            ['id' => 7, 'question' => 'Is there any ongoing court case related to this property?', 'weight' => -10, 'doc_type' => null],
            ['id' => 8, 'question' => 'Are all co-owners documented and in agreement?', 'weight' => 5, 'doc_type' => null],
            ['id' => 9, 'question' => 'Has the property been physically verified in the last 2 years?', 'weight' => 5, 'doc_type' => null],
            ['id' => 10, 'question' => 'Do you have the Duplicate Carbon Receipt (DCR)?', 'weight' => 5, 'doc_type' => 'dcr'],
            ['id' => 11, 'question' => 'Is the property free from any liens or encumbrances?', 'weight' => 5, 'doc_type' => null],
            ['id' => 12, 'question' => 'Do you know the exact boundaries (Position of Land)?', 'weight' => 3, 'doc_type' => 'position_of_land'],
            ['id' => 13, 'question' => 'Is someone locally managing or monitoring the property?', 'weight' => 2, 'doc_type' => null],
            ['id' => 14, 'question' => 'Have you paid property tax in the current fiscal year?', 'weight' => 5, 'doc_type' => null],
            ['id' => 15, 'question' => 'Do you have a Power of Attorney for property management?', 'weight' => 5, 'doc_type' => null],
        ];

        foreach ($questions as $index => $question) {
            DB::table('assessment_questions')->updateOrInsert(
                ['id' => $question['id']],
                [
                    'question' => $question['question'],
                    'weight' => $question['weight'],
                    'doc_type' => $question['doc_type'],
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('assessment_questions')->whereIn('id', range(1, 15))->delete();
    }
};
