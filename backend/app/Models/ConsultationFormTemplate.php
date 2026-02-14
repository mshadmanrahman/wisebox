<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ConsultationFormTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
        'sort_order',
        'audience',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Fields belonging to this template
     */
    public function fields(): HasMany
    {
        return $this->hasMany(ConsultationFormField::class, 'template_id')->orderBy('sort_order');
    }

    /**
     * Responses using this template
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ConsultationResponse::class, 'template_id');
    }

    /**
     * Services that use this template
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'service_consultation_templates', 'template_id', 'service_id')
            ->withPivot('is_required')
            ->withTimestamps();
    }

    /**
     * Scope for active templates only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by audience: 'consultant' or 'customer'
     */
    public function scopeForAudience($query, string $audience)
    {
        return $query->where('audience', $audience);
    }
}
