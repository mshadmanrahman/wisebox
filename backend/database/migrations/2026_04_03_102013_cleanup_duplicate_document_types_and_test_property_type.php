<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * WB-221: Remove duplicate document types caused by two migrations using different slug formats.
 * Migration 2026_02_19_215600 used hyphen-based slugs (recorded-khatian, mutation-khatian, via-deed).
 * Migration 2026_02_20_000005 used underscore-based slugs (recorded_khatian, mutation_khatian, via_deed).
 * Both created separate rows since slug is unique. This migration deactivates the old hyphen-slug entries.
 *
 * WB-228: Deactivate the "Test" property type that was manually created.
 */
return new class extends Migration
{
    public function up(): void
    {
        // WB-221: Deactivate duplicate document types with old hyphen-based slugs.
        // The canonical entries use underscore-based slugs from the seeder / migration 2026_02_20_000005.
        $oldHyphenSlugs = [
            'recorded-khatian',
            'mutation-khatian',
            'via-deed',
            'tax-receipt',
            'court-decree',
            'position-of-land',
            'possession-of-land',
            'settlement-gazette',
            'succession-certificate',
        ];

        DB::table('document_types')
            ->whereIn('slug', $oldHyphenSlugs)
            ->update(['is_active' => false, 'updated_at' => now()]);

        // WB-228: Deactivate the "Test" property type.
        DB::table('property_types')
            ->where(fn ($q) => $q->where('slug', 'test')->orWhere('name', 'Test'))
            ->update(['is_active' => false, 'updated_at' => now()]);
    }

    public function down(): void
    {
        $oldHyphenSlugs = [
            'recorded-khatian',
            'mutation-khatian',
            'via-deed',
            'tax-receipt',
            'court-decree',
            'position-of-land',
            'possession-of-land',
            'settlement-gazette',
            'succession-certificate',
        ];

        DB::table('document_types')
            ->whereIn('slug', $oldHyphenSlugs)
            ->update(['is_active' => true, 'updated_at' => now()]);

        DB::table('property_types')
            ->where(fn ($q) => $q->where('slug', 'test')->orWhere('name', 'Test'))
            ->update(['is_active' => true, 'updated_at' => now()]);
    }
};
