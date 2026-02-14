<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Creates test users for E2E Playwright tests.
 * Only runs in local/testing environments.
 */
class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $users = [
            [
                'name' => 'Test Customer',
                'email' => 'connectshadman@gmail.com',
                'password' => Hash::make('TestPass123'),
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Test Consultant',
                'email' => 'consultant@wisebox.com',
                'password' => Hash::make('TestPass123'),
                'role' => 'consultant',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Wisebox Admin',
                'email' => 'admin@wisebox.local',
                'password' => Hash::make('TestPass123'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
