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
        Schema::create('maternal_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mother_id')->constrained('mothers')->onDelete('cascade');
            $table->foreignId('assessment_type_id')->constrained('maternal_assessment_types')->onDelete('cascade');
            $table->dateTime('assessment_date');
            $table->json('findings')->nullable()->comment('JSON storage for flexible assessment data');
            $table->enum('status', ['pending', 'completed', 'requires_followup', 'not_applicable'])->default('pending');
            $table->foreignId('assessed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->text('followup_requirements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maternal_assessments');
    }
};
