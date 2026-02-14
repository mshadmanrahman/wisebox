<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add preferred_time_slots to orders table
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'preferred_time_slots')) {
                $table->json('preferred_time_slots')->nullable()->after('notes');
            }
        });

        // Add fields to tickets table (check each one individually)
        Schema::table('tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('tickets', 'preferred_time_slots')) {
                $table->json('preferred_time_slots')->nullable()->after('description');
            }
            if (!Schema::hasColumn('tickets', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('tickets', 'meet_link')) {
                $table->string('meet_link')->nullable()->after('completed_at');
            }
            if (!Schema::hasColumn('tickets', 'consultation_notes')) {
                $table->text('consultation_notes')->nullable()->after('meet_link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('preferred_time_slots');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_time_slots',
                'scheduled_at',
                'completed_at',
                'meet_link',
                'consultation_notes',
            ]);
        });
    }
};
