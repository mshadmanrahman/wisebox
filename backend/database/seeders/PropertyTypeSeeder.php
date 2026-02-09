<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PropertyTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Land', 'slug' => 'land', 'description' => 'Includes ground, structure and water', 'icon' => 'land', 'sort_order' => 1],
            ['name' => 'Apartment', 'slug' => 'apartment', 'description' => 'Residential unit in a building complex', 'icon' => 'apartment', 'sort_order' => 2],
            ['name' => 'Commercial', 'slug' => 'commercial', 'description' => 'Commercial or business property', 'icon' => 'commercial', 'sort_order' => 3],
            ['name' => 'Agricultural', 'slug' => 'agricultural', 'description' => 'Farming or agricultural land', 'icon' => 'agricultural', 'sort_order' => 4],
            ['name' => 'Industrial', 'slug' => 'industrial', 'description' => 'Industrial or manufacturing property', 'icon' => 'industrial', 'sort_order' => 5],
        ];

        foreach ($types as $type) {
            DB::table('property_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
