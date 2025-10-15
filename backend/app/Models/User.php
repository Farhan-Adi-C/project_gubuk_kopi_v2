<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

      protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if ($user->email === 'admin@gmail.com') {
                $user->is_admin = true;
            }
        });

        static::updating(function ($user) {
            if ($user->isDirty('email') && $user->getOriginal('email') === 'admin@gmail.com') {
                $user->is_admin = true;
            }
        });
    }

   public function carts()
{
    return $this->hasMany(Cart::class);
}


public function orders()
{
    return $this->hasMany(Order::class);
}


}
