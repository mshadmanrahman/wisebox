<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Use getenv() instead of env() because Laravel's env() returns null
        // when config is cached (Railpacks runs config:cache during deploy)
        $email = getenv('ADMIN_EMAIL') ?: null;
        $password = getenv('ADMIN_PASSWORD') ?: null;
        $name = getenv('ADMIN_NAME') ?: 'Wisebox Admin';

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

