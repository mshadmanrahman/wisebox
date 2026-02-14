<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultation_form_templates', function (Blueprint $table) {
            $table->string('audience', 20)->default('consultant')->after('sort_order');
            $table->index('audience');
        });

        // Mark all existing templates as consultant-facing
        DB::table('consultation_form_templates')
            ->whereNull('audience')
            ->orWhere('audience', '')
            ->update(['audience' => 'consultant']);
    }

    public function down(): void
    {
        Schema::table('consultation_form_templates', function (Blueprint $table) {
            $table->dropIndex(['audience']);
            $table->dropColumn('audience');
        });
    }
};
