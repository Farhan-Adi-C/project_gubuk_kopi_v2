<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $guarded = [];
    
    public function product(){
        return $this->belongsTo(Product::class);
    }

    public function carts()
{
    return $this->hasMany(Cart::class, 'variant_id');
}


public function orderItems()
{
    return $this->hasMany(OrderItem::class, 'variant_id');
}

}
