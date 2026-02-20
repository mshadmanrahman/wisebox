<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Seed property types via migration (Railpacks runs migrate --force but NOT db:seed).
 * Mirrors PropertyTypeSeeder data. Idempotent via updateOrInsert on slug.
 */
return new class extends Migration
{
    public function up(): void
    {
        $types = [
            ['name' => 'Land', 'slug' => 'land', 'description' => 'Includes ground, structure and water', 'icon' => 'land', 'sort_order' => 1],
            ['name' => 'Building', 'slug' => 'building', 'description' => 'Entire building ownership (all floors/units)', 'icon' => 'building', 'sort_order' => 2],
            ['name' => 'Apartment', 'slug' => 'apartment', 'description' => 'Residential unit in a building complex', 'icon' => 'apartment', 'sort_order' => 3],
            ['name' => 'Commercial', 'slug' => 'commercial', 'description' => 'Commercial or business property', 'icon' => 'commercial', 'sort_order' => 4],
            ['name' => 'Agricultural', 'slug' => 'agricultural', 'description' => 'Farming or agricultural land', 'icon' => 'agricultural', 'sort_order' => 5],
            ['name' => 'Industrial', 'slug' => 'industrial', 'description' => 'Industrial or manufacturing property', 'icon' => 'industrial', 'sort_order' => 6],
        ];

        foreach ($types as $type) {
            DB::table('property_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    public function down(): void
    {
        DB::table('property_types')->whereIn('slug', [
            'land', 'building', 'apartment', 'commercial', 'agricultural', 'industrial',
        ])->delete();
    }
};
