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
        Schema::create('qr_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mother_id')->nullable()->constrained('mothers')->onDelete('cascade');
            $table->foreignId('newborn_id')->nullable()->constrained('newborns')->onDelete('cascade');
            $table->string('mother_qr_code')->nullable();
            $table->string('newborn_qr_code')->nullable();
            $table->enum('verification_result', ['match', 'no_match', 'error'])->default('error');
            $table->text('failure_reason')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_verifications');
    }
};
