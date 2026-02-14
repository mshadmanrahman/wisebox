<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationResponse extends Model
{
    protected $fillable = [
        'ticket_id',
        'template_id',
        'consultant_id',
        'responses',
        'summary',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
        ];
    }

    /**
     * Ticket this response belongs to
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Template used for this response
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ConsultationFormTemplate::class, 'template_id');
    }

    /**
     * Consultant who filled the form
     */
    public function consultant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'consultant_id');
    }

    /**
     * Get a specific field response by field name
     */
    public function getFieldResponse(string $fieldName)
    {
        return $this->responses[$fieldName] ?? null;
    }

    /**
     * Generate a summary of the responses
     */
    public function generateSummary(): string
    {
        $template = $this->template()->with('fields')->first();
        if (!$template) {
            return '';
        }

        $summary = [];
        foreach ($template->fields as $field) {
            $value = $this->getFieldResponse($field->field_name);
            if ($value !== null && $value !== '' && $value !== []) {
                $display = is_array($value) ? implode(', ', $value) : $value;
                $summary[] = "{$field->field_label}: {$display}";
            }
        }

        return implode("\n", $summary);
    }
}
