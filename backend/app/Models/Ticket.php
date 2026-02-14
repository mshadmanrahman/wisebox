<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number', 'order_id', 'property_id', 'customer_id', 'consultant_id', 'service_id',
        'title', 'description', 'preferred_time_slots',
        'calendly_event_id', 'calendly_event_url', 'meeting_url', 'meet_link',
        'scheduled_at', 'completed_at', 'meeting_duration_minutes',
        'priority', 'status', 'resolved_at', 'resolution_notes', 'consultation_notes',
        'is_free_consultation',
    ];

    protected function casts(): array
    {
        return [
            'preferred_time_slots' => 'array',
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
            'resolved_at' => 'datetime',
            'is_free_consultation' => 'boolean',
        ];
    }

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function consultant(): BelongsTo { return $this->belongsTo(User::class, 'consultant_id'); }
    public function service(): BelongsTo { return $this->belongsTo(Service::class); }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    public function consultationResponses(): HasMany
    {
        return $this->hasMany(ConsultationResponse::class);
    }
}
