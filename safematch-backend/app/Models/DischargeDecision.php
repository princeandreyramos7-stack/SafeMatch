<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DischargeDecision extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'discharge_record_id',
        'mother_id',
        'newborn_id',
        'decision',
        'decision_notes',
        'decided_by',
        'decision_date',
        'actual_discharge_date',
        'discharge_instructions',
    ];

    protected $casts = [
        'decision_date' => 'datetime',
        'actual_discharge_date' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['discharge_record_id', 'decision', 'decided_by'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function dischargeRecord()
    {
        return $this->belongsTo(DischargeRecord::class);
    }

    public function mother()
    {
        return $this->belongsTo(Mother::class);
    }

    public function newborn()
    {
        return $this->belongsTo(Newborn::class);
    }

    public function decidedBy()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('decision', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('decision', 'pending');
    }
}
