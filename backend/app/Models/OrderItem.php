<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    public $timestamps = false;
    protected $fillable = ['order_id', 'service_id', 'quantity', 'unit_price', 'total_price'];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'total_price' => 'decimal:2'];
    }

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function service(): BelongsTo { return $this->belongsTo(Service::class); }
}
