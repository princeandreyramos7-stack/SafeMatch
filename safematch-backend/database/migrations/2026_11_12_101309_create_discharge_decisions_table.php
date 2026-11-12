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
        Schema::create('discharge_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discharge_record_id')->constrained('discharge_records')->onDelete('cascade');
            $table->foreignId('mother_id')->constrained('mothers')->onDelete('cascade');
            $table->foreignId('newborn_id')->constrained('newborns')->onDelete('cascade');
            $table->enum('decision', ['approved', 'pending', 'requires_attention'])->default('pending');
            $table->text('decision_notes')->nullable();
            $table->foreignId('decided_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('decision_date')->nullable();
            $table->timestamp('actual_discharge_date')->nullable();
            $table->text('discharge_instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discharge_decisions');
    }
};
