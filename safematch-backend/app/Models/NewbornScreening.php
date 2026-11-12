<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class NewbornScreening extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'newborn_id',
        'screening_type_id',
        'scheduled_date',
        'performed_date',
        'assigned_personnel_id',
        'status',
        'result',
        'remarks',
        'completed_at',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'performed_date' => 'date',
        'completed_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['newborn_id', 'screening_type_id', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function newborn()
    {
        return $this->belongsTo(Newborn::class);
    }

    public function screeningType()
    {
        return $this->belongsTo(NewbornScreeningType::class);
    }

    public function assignedPersonnel()
    {
        return $this->belongsTo(User::class, 'assigned_personnel_id');
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
