<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAssessment extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'property_id', 'assessed_by', 'overall_score', 'score_status',
        'document_score', 'ownership_score', 'risk_factors', 'recommendations',
        'summary', 'detailed_report',
    ];

    protected function casts(): array
    {
        return [
            'risk_factors' => 'array',
            'recommendations' => 'array',
        ];
    }

    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function assessor(): BelongsTo { return $this->belongsTo(User::class, 'assessed_by'); }
}
