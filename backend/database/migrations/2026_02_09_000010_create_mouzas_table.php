<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouzas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upazila_id')->constrained();
            $table->string('name', 100);
            $table->string('bn_name', 100)->nullable();
            $table->string('jl_number', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouzas');
    }
};
