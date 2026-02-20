<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $email = getenv('ADMIN_EMAIL') ?: null;
        $password = getenv('ADMIN_PASSWORD') ?: null;
        $name = getenv('ADMIN_NAME') ?: 'Wisebox Admin';

        if (!$email || !$password) {
            return;
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,  // User model has 'hashed' cast; no manual Hash::make()
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        $email = getenv('ADMIN_EMAIL') ?: null;
        if ($email) {
            User::where('email', $email)->delete();
        }
    }
};
