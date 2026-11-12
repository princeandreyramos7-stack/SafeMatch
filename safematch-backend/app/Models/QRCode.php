<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class QRCode extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'qr_codes';

    protected $fillable = [
        'code',
        'qr_type',
        'qrcodeable_type',
        'qrcodeable_id',
        'token_hash',
        'image_path',
        'status',
        'generated_at',
        'revoked_at',
        'generated_by',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['code', 'qr_type', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Polymorphic relationship
    public function qrcodeable()
    {
        return $this->morphTo();
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeRevoked($query)
    {
        return $query->where('status', 'revoked');
    }

    // Helper methods
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isRevoked()
    {
        return $this->status === 'revoked';
    }
}
