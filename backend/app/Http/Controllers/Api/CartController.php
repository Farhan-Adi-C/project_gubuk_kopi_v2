<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function addToCart(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id'
        ]);

        try {
            $product = Product::findOrFail($request->product_id);
            
            if ($request->variant_id) {
                $variant = ProductVariant::where('id', $request->variant_id)
                    ->where('product_id', $request->product_id)
                    ->first();
                    
                if (!$variant) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Variant not found for this product'
                    ], 404);
                }
            }

            $existingCart = Cart::where('user_id', $user->id)
                ->where('product_id', $request->product_id)
                ->where('variant_id', $request->variant_id)
                ->where('status', 'pending')
                ->first();

            if ($existingCart) {
                $existingCart->increment('quantity');
                $existingCart->load(['product', 'variant']);

                return response()->json([
                    'success' => true,
                    'message' => 'Cart item quantity updated successfully',
                    'data' => $existingCart
                ], 200);
            }

            $cart = Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'variant_id' => $request->variant_id,
                'quantity' => $request->quantity ?? 1,
                'status' => 'pending'
            ]);

            $cart->load(['product', 'variant']);

            return response()->json([
                'success' => true,
                'message' => 'Product added to cart successfully',
                'data' => $cart
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCart(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $cartItems = Cart::with([
                'product', 
                'variant',
                'product.category'
            ])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->get();

            // Hitung total price dengan discount persentase
            $cartItems->each(function ($item) {
                // Hitung harga setelah discount (dalam persentase)
                $discountAmount = $item->product->price * ($item->product->discount / 100);
                $priceAfterDiscount = $item->product->price - $discountAmount;
                
                $variantPrice = $item->variant ? $item->variant->additional_price : 0;
                $item->total_price_per_item = ($priceAfterDiscount + $variantPrice) * $item->quantity;
            });

            $totalCartAmount = $cartItems->sum('total_price_per_item');

            return response()->json([
                'success' => true,
                'message' => 'Cart retrieved successfully',
                'data' => [
                    'items' => $cartItems,
                    'total_cart_amount' => $totalCartAmount
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateCartQuantity(Request $request, $cartId)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $cart = Cart::where('user_id', $user->id)
                ->where('id', $cartId)
                ->where('status', 'pending')
                ->firstOrFail();

            $cart->update([
                'quantity' => $request->quantity
            ]);

            $cart->load(['product', 'variant']);

            return response()->json([
                'success' => true,
                'message' => 'Cart quantity updated successfully',
                'data' => $cart
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart quantity',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeFromCart(Request $request, $cartId)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $cart = Cart::where('user_id', $user->id)
                ->where('id', $cartId)
                ->where('status', 'pending')
                ->firstOrFail();

            $cart->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}