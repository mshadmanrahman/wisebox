<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        $name = env('ADMIN_NAME', 'Wisebox Admin');

        // In production, only seed if ADMIN_EMAIL and ADMIN_PASSWORD are explicitly set
        if (app()->environment('production') && (!$email || !$password)) {
            return;
        }

        // Fall back to defaults for local/testing
        $email = $email ?: 'admin@wisebox.local';
        $password = $password ?: 'Admin123!';

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}

