<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Make property type FK columns nullable to support draft properties
 * created from the free assessment flow (no type selected yet).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('property_type_id')->nullable()->change();
            $table->foreignId('ownership_status_id')->nullable()->change();
            $table->foreignId('ownership_type_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('property_type_id')->nullable(false)->change();
            $table->foreignId('ownership_status_id')->nullable(false)->change();
            $table->foreignId('ownership_type_id')->nullable(false)->change();
        });
    }
};
