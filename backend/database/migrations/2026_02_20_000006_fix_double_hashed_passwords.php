<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

/**
 * Fix double-hashed passwords caused by Hash::make() + User model 'hashed' cast.
 *
 * Original seed migrations (2026_02_15_000001-3) called Hash::make() explicitly,
 * but the User model has `'password' => 'hashed'` cast which auto-hashes on set.
 * Result: bcrypt(bcrypt(password)) stored in DB, making login impossible.
 *
 * This migration resets the test account passwords by assigning plain text,
 * letting the 'hashed' cast handle hashing correctly.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Fix test customer
        $customer = User::where('email', 'customer@wiseboxinc.com')->first();
        if ($customer) {
            $customer->password = 'Wisebox2026!';
            $customer->save();
        }

        // Fix test consultant
        $consultant = User::where('email', 'consultant@wiseboxinc.com')->first();
        if ($consultant) {
            $consultant->password = 'Wisebox2026!';
            $consultant->save();
        }

        // Fix admin (re-read from env, same as original migration)
        $adminEmail = getenv('ADMIN_EMAIL') ?: null;
        $adminPassword = getenv('ADMIN_PASSWORD') ?: null;
        if ($adminEmail && $adminPassword) {
            $admin = User::where('email', $adminEmail)->first();
            if ($admin) {
                $admin->password = $adminPassword;
                $admin->save();
            }
        }
    }

    public function down(): void
    {
        // No rollback needed; passwords are now correctly hashed
    }
};
