<?php

use Database\Seeders\TranslationSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Re-seed translations with complete key set (all 11 namespaces).
 * Uses updateOrCreate so this is idempotent.
 */
return new class extends Migration
{
    public function up(): void
    {
        (new TranslationSeeder)->run();
    }

    public function down(): void
    {
        // no-op; previous migration handles truncation
    }
};
