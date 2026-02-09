<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OwnershipTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Sole Ownership',
                'slug' => 'sole',
                'description' => 'You are the only owner of this property',
                'requires_co_owners' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Joint Ownership',
                'slug' => 'joint',
                'description' => 'Shared ownership where all parties have equal rights',
                'requires_co_owners' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Co-Ownership without Partition',
                'slug' => 'co_ownership',
                'description' => 'Shared but undivided ownership, common in family property',
                'requires_co_owners' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($types as $type) {
            DB::table('ownership_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
