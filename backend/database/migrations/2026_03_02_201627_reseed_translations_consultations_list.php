<?php

use Database\Seeders\TranslationSeeder;
use Illuminate\Database\Migrations\Migration;

/**
 * Re-seed translations to add missing consultations list keys:
 * statusLabels.open, percentComplete, preferredSlots
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
