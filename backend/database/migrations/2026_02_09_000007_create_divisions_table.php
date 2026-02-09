<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('bn_name', 100)->nullable();
            $table->string('country_code', 3)->default('BGD');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('divisions');
    }
};
