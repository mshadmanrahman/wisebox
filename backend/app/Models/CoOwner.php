<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoOwner extends Model
{
    protected $fillable = [
        'property_id',
        'name',
        'relationship',
        'ownership_percentage',
        'phone',
        'email',
        'nid_number',
    ];

    protected function casts(): array
    {
        return [
            'ownership_percentage' => 'decimal:2',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
