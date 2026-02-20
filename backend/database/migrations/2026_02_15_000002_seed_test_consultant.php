<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        User::updateOrCreate(
            ['email' => 'consultant@wiseboxinc.com'],
            [
                'name' => 'Test Consultant',
                'password' => 'Wisebox2026!',  // User model has 'hashed' cast; no manual Hash::make()
                'role' => 'consultant',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        User::where('email', 'consultant@wiseboxinc.com')->delete();
    }
};
