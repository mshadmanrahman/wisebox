<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('property_name');
            $table->foreignId('property_type_id')->constrained('property_types');
            $table->foreignId('ownership_status_id')->constrained('ownership_statuses');
            $table->foreignId('ownership_type_id')->constrained('ownership_types');

            // Location hierarchy
            $table->string('country_code', 3)->default('BGD');
            $table->foreignId('division_id')->nullable()->constrained('divisions');
            $table->foreignId('district_id')->nullable()->constrained('districts');
            $table->foreignId('upazila_id')->nullable()->constrained('upazilas');
            $table->foreignId('mouza_id')->nullable()->constrained('mouzas');
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Property details
            $table->decimal('size_value', 12, 4)->nullable();
            $table->enum('size_unit', ['sqft', 'katha', 'bigha', 'acre', 'decimal', 'shotangsho'])->nullable();
            $table->text('description')->nullable();

            // Assessment
            $table->integer('completion_percentage')->default(0);
            $table->enum('completion_status', ['red', 'yellow', 'green'])->default('red');

            // State
            $table->enum('status', ['draft', 'active', 'under_review', 'verified', 'archived'])->default('draft');
            $table->json('draft_data')->nullable();
            $table->timestamp('last_draft_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('completion_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
