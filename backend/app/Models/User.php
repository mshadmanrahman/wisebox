<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'phone',
        'phone_verified_at',
        'country_of_residence',
        'avatar_url',
        'role',
        'google_id',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function consultantProfile()
    {
        return $this->hasOne(ConsultantProfile::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'customer_id');
    }

    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'consultant_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    public function scopeConsultants($query)
    {
        return $query->where('role', 'consultant');
    }

    // Helpers
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isConsultant(): bool
    {
        return $this->role === 'consultant';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }
}
