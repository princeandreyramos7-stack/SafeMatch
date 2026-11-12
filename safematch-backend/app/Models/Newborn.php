<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Newborn extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'newborn_id',
        'mother_id',
        'full_name',
        'date_time_of_birth',
        'sex',
        'birth_weight',
        'birth_length',
        'birth_head_circumference',
        'delivery_info',
        'attending_personnel_id',
        'status',
    ];

    protected $casts = [
        'date_time_of_birth' => 'datetime',
        'birth_weight' => 'decimal:2',
        'birth_length' => 'decimal:2',
        'birth_head_circumference' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['newborn_id', 'full_name', 'mother_id', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function mother()
    {
        return $this->belongsTo(Mother::class);
    }

    public function attendingPersonnel()
    {
        return $this->belongsTo(User::class, 'attending_personnel_id');
    }

    public function qrCode()
    {
        return $this->morphOne(QRCode::class, 'qrcodeable');
    }

    public function screenings()
    {
        return $this->hasMany(NewbornScreening::class);
    }

    public function qrVerifications()
    {
        return $this->hasMany(QRVerification::class);
    }

    public function dischargeRecords()
    {
        return $this->hasMany(DischargeRecord::class);
    }
}
