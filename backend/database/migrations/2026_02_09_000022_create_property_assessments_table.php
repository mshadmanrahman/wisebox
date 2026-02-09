<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assessed_by')->nullable()->constrained('users')->nullOnDelete();

            // Score
            $table->integer('overall_score');
            $table->enum('score_status', ['red', 'yellow', 'green']);

            // Breakdown
            $table->integer('document_score');
            $table->integer('ownership_score');
            $table->json('risk_factors')->nullable();
            $table->json('recommendations')->nullable();

            $table->text('summary')->nullable();
            $table->text('detailed_report')->nullable();

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_assessments');
    }
};
