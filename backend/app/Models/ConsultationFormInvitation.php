<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class ConsultationFormInvitation extends Model
{
    protected $fillable = [
        'ticket_id',
        'template_id',
        'consultant_id',
        'customer_email',
        'token',
        'status',
        'sent_at',
        'completed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $invitation) {
            if (empty($invitation->token)) {
                $invitation->token = Str::random(64);
            }
        });
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ConsultationFormTemplate::class, 'template_id');
    }

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'consultant_id');
    }

    /**
     * Get the consultation response created from this invitation.
     *
     * NOTE: This relationship uses a runtime $this->template_id constraint,
     * so it should only be accessed on a single model instance ($invitation->response),
     * never eager-loaded on collections (->with('response') will produce wrong results).
     */
    public function response(): HasOne
    {
        return $this->hasOne(ConsultationResponse::class, 'ticket_id', 'ticket_id')
            ->where('template_id', $this->template_id);
    }

    /**
     * Scope: only pending invitations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: valid invitations (pending + not expired)
     */
    public function scopeValid($query)
    {
        return $query->where('status', 'pending')
            ->where('expires_at', '>', now());
    }

    /**
     * Check if the invitation is still valid for submission
     */
    public function isValid(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isFuture();
    }

    /**
     * Mark the invitation as completed
     */
    public function markCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
