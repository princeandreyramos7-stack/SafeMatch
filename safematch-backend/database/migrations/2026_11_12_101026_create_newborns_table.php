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
        Schema::create('newborns', function (Blueprint $table) {
            $table->id();
            $table->string('newborn_id')->unique();
            $table->foreignId('mother_id')->constrained('mothers')->onDelete('cascade');
            $table->string('full_name')->nullable();
            $table->dateTime('date_time_of_birth');
            $table->enum('sex', ['male', 'female', 'undetermined'])->default('undetermined');
            $table->decimal('birth_weight', 8, 2)->nullable()->comment('in grams');
            $table->decimal('birth_length', 8, 2)->nullable()->comment('in cm');
            $table->decimal('birth_head_circumference', 8, 2)->nullable()->comment('in cm');
            $table->text('delivery_info')->nullable();
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
        Schema::dropIfExists('newborns');
    }
};
