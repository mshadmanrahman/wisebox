<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mouza extends Model
{
    public $timestamps = false;
    protected $fillable = ['upazila_id', 'name', 'bn_name', 'jl_number'];

    public function upazila(): BelongsTo
    {
        return $this->belongsTo(Upazila::class);
    }
}
