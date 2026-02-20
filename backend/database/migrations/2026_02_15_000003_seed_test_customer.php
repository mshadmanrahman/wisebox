<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        User::updateOrCreate(
            ['email' => 'customer@wiseboxinc.com'],
            [
                'name' => 'Test Customer',
                'password' => 'Wisebox2026!',  // User model has 'hashed' cast; no manual Hash::make()
                'role' => 'customer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        User::where('email', 'customer@wiseboxinc.com')->delete();
    }
};
