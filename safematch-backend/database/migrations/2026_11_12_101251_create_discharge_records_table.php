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
        Schema::create('discharge_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mother_id')->constrained('mothers')->onDelete('cascade');
            $table->foreignId('newborn_id')->constrained('newborns')->onDelete('cascade');
            $table->enum('readiness_status', ['pending', 'awaiting_review', 'ready', 'discharged'])->default('pending');
            $table->decimal('completion_percentage', 5, 2)->default(0.00);
            $table->json('completed_requirements')->nullable();
            $table->json('pending_requirements')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discharge_records');
    }
};
