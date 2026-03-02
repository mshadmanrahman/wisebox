<?php

use Database\Seeders\TranslationSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Re-seed translations to add missing admin keys:
 * detail.documentsCount, detail.assignConsultant
 */
return new class extends Migration
{
    public function up(): void
    {
        (new TranslationSeeder)->run();
    }

    public function down(): void
    {
        // no-op; seeder uses updateOrCreate (idempotent)
    }
};
