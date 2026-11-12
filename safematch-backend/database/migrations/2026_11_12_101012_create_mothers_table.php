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
        Schema::create('mothers', function (Blueprint $table) {
            $table->id();
            $table->string('mother_id')->unique();
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->text('admission_info')->nullable();
            $table->date('admission_date')->nullable();
            $table->foreignId('attending_personnel_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['active', 'discharged', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mothers');
    }
};
