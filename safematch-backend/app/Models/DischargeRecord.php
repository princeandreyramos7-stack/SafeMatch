<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DischargeRecord extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'mother_id',
        'newborn_id',
        'readiness_status',
        'completion_percentage',
        'completed_requirements',
        'pending_requirements',
        'notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'completion_percentage' => 'decimal:2',
        'completed_requirements' => 'array',
        'pending_requirements' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['mother_id', 'newborn_id', 'readiness_status', 'completion_percentage'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function mother()
    {
        return $this->belongsTo(Mother::class);
    }

    public function newborn()
    {
        return $this->belongsTo(Newborn::class);
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function dischargeDecision()
    {
        return $this->hasOne(DischargeDecision::class);
    }

    // Scopes
    public function scopeReady($query)
    {
        return $query->where('readiness_status', 'ready');
    }

    public function scopePending($query)
    {
        return $query->where('readiness_status', 'pending');
    }
}
