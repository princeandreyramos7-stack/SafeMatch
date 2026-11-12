<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewbornScreeningType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'is_required',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function screenings()
    {
        return $this->hasMany(NewbornScreening::class, 'screening_type_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
