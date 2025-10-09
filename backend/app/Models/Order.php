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

    /**
     * Relasi ke OrderItems (jika kamu buat tabel order_items nanti)
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
