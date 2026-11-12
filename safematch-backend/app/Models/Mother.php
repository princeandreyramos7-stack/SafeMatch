<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Mother extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'mother_id',
        'full_name',
        'date_of_birth',
        'contact_number',
        'address',
        'admission_info',
        'admission_date',
        'attending_personnel_id',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_date' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['mother_id', 'full_name', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function attendingPersonnel()
    {
        return $this->belongsTo(User::class, 'attending_personnel_id');
    }

    public function newborns()
    {
        return $this->hasMany(Newborn::class);
    }

    public function qrCode()
    {
        return $this->morphOne(QRCode::class, 'qrcodeable');
    }

    public function maternalAssessments()
    {
        return $this->hasMany(MaternalAssessment::class);
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
