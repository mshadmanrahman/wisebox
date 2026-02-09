<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnershipType extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'requires_co_owners', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'requires_co_owners' => 'boolean'];
    }
}
