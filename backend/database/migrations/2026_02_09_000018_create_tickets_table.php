<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->constrained();
            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('consultant_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // Scheduling
            $table->string('calendly_event_id')->nullable();
            $table->string('calendly_event_url', 500)->nullable();
            $table->string('meeting_url', 500)->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->integer('meeting_duration_minutes')->nullable();

            // State
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', [
                'open', 'assigned', 'in_progress', 'awaiting_customer',
                'awaiting_consultant', 'scheduled', 'completed', 'cancelled'
            ])->default('open');

            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();

            $table->timestamps();

            $table->index(['consultant_id', 'status']);
            $table->index('customer_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
