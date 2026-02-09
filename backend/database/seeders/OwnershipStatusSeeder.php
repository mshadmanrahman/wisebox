<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OwnershipStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Ownership by Purchase / Sale Deed',
                'slug' => 'purchase',
                'display_label' => 'I purchased it',
                'bengali_label' => 'কয়',
                'description' => 'This property is exclusively yours',
                'sort_order' => 1,
            ],
            [
                'name' => 'Ownership by Gift (Heba / Gift Deed)',
                'slug' => 'gift',
                'display_label' => 'I received it as a gift',
                'bengali_label' => 'হেবা',
                'description' => 'Ownership can be claimed by multiple entity',
                'sort_order' => 2,
            ],
            [
                'name' => 'Ownership by Inheritance / Succession',
                'slug' => 'inheritance',
                'display_label' => 'I inherited it',
                'bengali_label' => 'উত্তরাধিকার',
                'description' => 'You hold power of attorney',
                'sort_order' => 3,
            ],
            [
                'name' => 'Ownership by Court Decree / Order',
                'slug' => 'court_decree',
                'display_label' => 'I own it by court order/decree',
                'bengali_label' => 'ডিক্রি',
                'description' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'Ownership by Settlement / Lease / Patta',
                'slug' => 'settlement',
                'display_label' => 'I own it by lease',
                'bengali_label' => 'বন্দোবস্ত',
                'description' => null,
                'sort_order' => 5,
            ],
            [
                'name' => 'SP Ownership by Donation/Religious Trust (Devottor / Waqf)',
                'slug' => 'donation_waqf',
                'display_label' => 'It was donated or is a religious trust',
                'bengali_label' => 'এওয়াজ/বিনিময়',
                'description' => 'You hold power of attorney',
                'sort_order' => 6,
            ],
            [
                'name' => 'Family Property (Registered in Parents Name)',
                'slug' => 'family',
                'display_label' => 'I do not own it, it\'s family property',
                'bengali_label' => 'পারিবারিক সম্পত্তি',
                'description' => null,
                'sort_order' => 7,
            ],
        ];

        foreach ($statuses as $status) {
            DB::table('ownership_statuses')->updateOrInsert(
                ['slug' => $status['slug']],
                array_merge($status, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
