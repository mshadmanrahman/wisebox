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
                'password' => Hash::make('Wisebox2026!'),
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
