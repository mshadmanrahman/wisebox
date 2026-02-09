<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'property_name',
        'property_type_id',
        'ownership_status_id',
        'ownership_type_id',
        'country_code',
        'division_id',
        'district_id',
        'upazila_id',
        'mouza_id',
        'address',
        'latitude',
        'longitude',
        'size_value',
        'size_unit',
        'description',
        'completion_percentage',
        'completion_status',
        'status',
        'draft_data',
        'last_draft_at',
    ];

    protected function casts(): array
    {
        return [
            'draft_data' => 'array',
            'last_draft_at' => 'datetime',
            'size_value' => 'decimal:4',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function ownershipStatus(): BelongsTo
    {
        return $this->belongsTo(OwnershipStatus::class);
    }

    public function ownershipType(): BelongsTo
    {
        return $this->belongsTo(OwnershipType::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function upazila(): BelongsTo
    {
        return $this->belongsTo(Upazila::class);
    }

    public function mouza(): BelongsTo
    {
        return $this->belongsTo(Mouza::class);
    }

    public function coOwners(): HasMany
    {
        return $this->hasMany(CoOwner::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(PropertyDocument::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(PropertyAssessment::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
