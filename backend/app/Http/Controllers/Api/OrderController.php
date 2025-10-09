<?php

namespace App\Http\Controllers\Api;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $request->validate([
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string'
        ]);

        try {
            // Get cart items
            $cartItems = Cart::with(['product', 'variant'])
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Calculate total amount dengan discount persentase
            $totalAmount = 0;
            foreach ($cartItems as $item) {
                // Hitung harga setelah discount (dalam persentase)
                $discountAmount = $item->product->price * ($item->product->discount / 100);
                $priceAfterDiscount = $item->product->price - $discountAmount;
                
                $variantPrice = $item->variant ? $item->variant->additional_price : 0;
                $itemPrice = $priceAfterDiscount + $variantPrice;
                $totalAmount += $itemPrice * $item->quantity;
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'midtrans_order_id' => 'ORDER-' . Str::random(10),
                'shipping_address' => $request->shipping_address,
            ]);

            // Create order items dengan discount persentase
            foreach ($cartItems as $item) {
                // Hitung harga setelah discount (dalam persentase)
                $discountAmount = $item->product->price * ($item->product->discount / 100);
                $priceAfterDiscount = $item->product->price - $discountAmount;
                
                $variantPrice = $item->variant ? $item->variant->additional_price : 0;
                $itemPrice = $priceAfterDiscount + $variantPrice;
                $subtotal = $itemPrice * $item->quantity;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'price' => $itemPrice,
                    'quantity' => $item->quantity,
                    'subtotal' => $subtotal,
                ]);
            }

            // Update cart items status to completed
            Cart::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'checked_out']);

            $order->load(['items.product', 'items.variant']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderHistory(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $orders = Order::with(['items.product', 'items.variant'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Order history retrieved successfully',
                'data' => $orders
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}