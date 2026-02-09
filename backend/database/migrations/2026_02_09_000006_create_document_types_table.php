<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->enum('category', ['primary', 'secondary']);
            $table->boolean('is_required')->default(false);
            $table->text('guidance_text')->nullable();
            $table->text('missing_guidance')->nullable();
            $table->json('accepted_formats')->nullable();
            $table->integer('max_file_size_mb')->default(10);
            $table->integer('score_weight')->default(0);
            $table->string('conditional_on_ownership', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('country_code', 3)->default('BGD');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
    }
};
