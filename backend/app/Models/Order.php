<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }

     public function meja()
    {
        return $this->belongsTo(Meja::class);
    }

    /**
     * Relasi ke OrderItems (jika kamu buat tabel order_items nanti)
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

     public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

     protected $casts = [
        'status_timestamps' => 'array',
    ];
}
