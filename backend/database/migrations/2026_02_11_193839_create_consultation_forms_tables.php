<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Form templates that define consultation forms
        Schema::create('consultation_form_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('is_active');
        });

        // Fields for each form template
        Schema::create('consultation_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('consultation_form_templates')->cascadeOnDelete();
            $table->string('field_type'); // text, textarea, select, radio, checkbox, date, number
            $table->string('field_label');
            $table->string('field_name'); // unique key for the field within the template
            $table->text('field_options')->nullable(); // JSON for select/radio/checkbox options
            $table->text('help_text')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['template_id', 'sort_order']);
        });

        // Completed consultation responses
        Schema::create('consultation_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('consultation_form_templates');
            $table->foreignId('consultant_id')->constrained('users');
            $table->json('responses'); // Store all field responses as JSON
            $table->text('summary')->nullable(); // Auto-generated summary or consultant notes
            $table->timestamps();

            $table->index('ticket_id');
            $table->index('consultant_id');
        });

        // Link templates to services (optional: some services may require specific forms)
        Schema::create('service_consultation_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('consultation_form_templates')->cascadeOnDelete();
            $table->boolean('is_required')->default(false);
            $table->timestamps();

            $table->unique(['service_id', 'template_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_consultation_templates');
        Schema::dropIfExists('consultation_responses');
        Schema::dropIfExists('consultation_form_fields');
        Schema::dropIfExists('consultation_form_templates');
    }
};
