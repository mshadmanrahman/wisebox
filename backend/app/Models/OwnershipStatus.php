<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnershipStatus extends Model
{
    protected $fillable = ['name', 'slug', 'display_label', 'bengali_label', 'description', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
