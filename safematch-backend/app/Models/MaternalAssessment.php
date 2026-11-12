<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class MaternalAssessment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'mother_id',
        'assessment_type_id',
        'assessment_date',
        'findings',
        'status',
        'assessed_by',
        'remarks',
        'followup_requirements',
    ];

    protected $casts = [
        'assessment_date' => 'datetime',
        'findings' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['mother_id', 'assessment_type_id', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function mother()
    {
        return $this->belongsTo(Mother::class);
    }

    public function assessmentType()
    {
        return $this->belongsTo(MaternalAssessmentType::class);
    }

    public function assessedBy()
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRequiresFollowup($query)
    {
        return $query->where('status', 'requires_followup');
    }
}
