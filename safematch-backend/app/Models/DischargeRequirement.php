<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DischargeRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'requirement_type',
        'description',
        'is_required',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeNewborn($query)
    {
        return $query->where('requirement_type', 'newborn');
    }

    public function scopeMaternal($query)
    {
        return $query->where('requirement_type', 'maternal');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
