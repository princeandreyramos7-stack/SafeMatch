<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'contact_number',
        'position',
        'profile_picture',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relationships
    public function mothersAttending()
    {
        return $this->hasMany(Mother::class, 'attending_personnel_id');
    }

    public function newbornsAttending()
    {
        return $this->hasMany(Newborn::class, 'attending_personnel_id');
    }

    public function qrCodesGenerated()
    {
        return $this->hasMany(QRCode::class, 'generated_by');
    }

    public function qrVerifications()
    {
        return $this->hasMany(QRVerification::class, 'verified_by');
    }

    public function screeningsAssigned()
    {
        return $this->hasMany(NewbornScreening::class, 'assigned_personnel_id');
    }

    public function assessmentsConducted()
    {
        return $this->hasMany(MaternalAssessment::class, 'assessed_by');
    }

    public function dischargeRecordsReviewed()
    {
        return $this->hasMany(DischargeRecord::class, 'reviewed_by');
    }

    public function dischargeDecisions()
    {
        return $this->hasMany(DischargeDecision::class, 'decided_by');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Helper methods
    public function isAdministrator()
    {
        return $this->role === 'administrator';
    }

    public function isHealthcarePersonnel()
    {
        return $this->role === 'healthcare_personnel';
    }
}
