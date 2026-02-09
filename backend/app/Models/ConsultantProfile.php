<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultantProfile extends Model
{
    protected $fillable = [
        'user_id',
        'specialization',
        'credentials',
        'years_experience',
        'languages',
        'calendly_url',
        'hourly_rate',
        'is_available',
        'rating',
        'total_reviews',
        'max_concurrent_tickets',
    ];

    protected function casts(): array
    {
        return [
            'specialization' => 'array',
            'languages' => 'array',
            'hourly_rate' => 'decimal:2',
            'rating' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
