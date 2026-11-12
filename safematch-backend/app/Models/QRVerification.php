<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QRVerification extends Model
{
    use HasFactory;

    protected $table = 'qr_verifications';

    protected $fillable = [
        'mother_id',
        'newborn_id',
        'mother_qr_code',
        'newborn_qr_code',
        'verification_result',
        'failure_reason',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function mother()
    {
        return $this->belongsTo(Mother::class);
    }

    public function newborn()
    {
        return $this->belongsTo(Newborn::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // Scopes
    public function scopeMatched($query)
    {
        return $query->where('verification_result', 'match');
    }

    public function scopeNotMatched($query)
    {
        return $query->where('verification_result', 'no_match');
    }
}
