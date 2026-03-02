<?php

use Database\Seeders\TranslationSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new TranslationSeeder)->run();
    }

    public function down(): void
    {
        \App\Models\Translation::truncate();
    }
};
