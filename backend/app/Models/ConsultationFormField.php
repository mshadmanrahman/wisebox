<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationFormField extends Model
{
    protected $fillable = [
        'template_id',
        'field_type',
        'field_label',
        'field_name',
        'field_options',
        'help_text',
        'is_required',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'field_options' => 'array',
            'is_required' => 'boolean',
        ];
    }

    /**
     * Template this field belongs to
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ConsultationFormTemplate::class, 'template_id');
    }

    /**
     * Get options as array (handles both array and JSON string)
     */
    public function getOptionsAttribute()
    {
        if (is_string($this->field_options)) {
            return json_decode($this->field_options, true) ?? [];
        }
        return $this->field_options ?? [];
    }
}
