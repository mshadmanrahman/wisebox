<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upazilas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained();
            $table->string('name', 100);
            $table->string('bn_name', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upazilas');
    }
};
