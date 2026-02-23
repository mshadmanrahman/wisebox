<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 5)->default('en');
            $table->string('namespace', 50)->default('common');
            $table->string('key', 255);
            $table->text('value');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['locale', 'namespace', 'key']);
            $table->index(['locale', 'namespace']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
