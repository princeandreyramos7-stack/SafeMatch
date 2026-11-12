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
        Schema::create('newborn_screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('newborn_id')->constrained('newborns')->onDelete('cascade');
            $table->foreignId('screening_type_id')->constrained('newborn_screening_types')->onDelete('cascade');
            $table->date('scheduled_date')->nullable();
            $table->date('performed_date')->nullable();
            $table->foreignId('assigned_personnel_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'scheduled', 'in_progress', 'completed', 'not_applicable', 'requires_followup'])->default('pending');
            $table->text('result')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newborn_screenings');
    }
};
