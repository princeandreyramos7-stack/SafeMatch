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
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('qr_type')->comment('mother or newborn');
            $table->morphs('qrcodeable');
            $table->string('token_hash');
            $table->string('image_path')->nullable();
            $table->enum('status', ['active', 'revoked', 'expired'])->default('active');
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};
