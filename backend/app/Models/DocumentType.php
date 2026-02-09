<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'category', 'is_required',
        'guidance_text', 'missing_guidance', 'accepted_formats',
        'max_file_size_mb', 'score_weight', 'conditional_on_ownership',
        'is_active', 'sort_order', 'country_code',
    ];

    protected function casts(): array
    {
        return [
            'accepted_formats' => 'array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('category', 'primary');
    }

    public function scopeSecondary($query)
    {
        return $query->where('category', 'secondary');
    }

    /**
     * Get document types applicable for a given ownership status slug.
     * Filters out conditional documents that don't match.
     */
    public function scopeForOwnership($query, ?string $ownershipSlug)
    {
        return $query->where(function ($q) use ($ownershipSlug) {
            $q->whereNull('conditional_on_ownership')
              ->orWhere('conditional_on_ownership', $ownershipSlug);
        });
    }
}
