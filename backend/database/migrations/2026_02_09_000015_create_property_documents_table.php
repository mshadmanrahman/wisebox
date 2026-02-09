<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained('document_types');
            $table->foreignId('user_id')->constrained();

            // File storage
            $table->string('file_path', 500);
            $table->string('file_name');
            $table->bigInteger('file_size'); // Bytes
            $table->string('mime_type', 100);

            // Status
            $table->enum('status', ['uploaded', 'under_review', 'verified', 'rejected'])->default('uploaded');
            $table->boolean('has_document')->default(true);
            $table->text('review_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['property_id', 'document_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_documents');
    }
};
