<?php

namespace App\Http\Controllers\Api;

use Midtrans\Snap;
use App\Models\Cart;
use Midtrans\Config;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
            'payment_method' => 'nullable|string'
        ]);

        try {
            // Get cart items (masih pending)
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

            // Calculate total amount
            $totalAmount = 0;
            foreach ($cartItems as $item) {
                $discountAmount = $item->product->price * ($item->product->discount / 100);
                $priceAfterDiscount = $item->product->price - $discountAmount;
                $variantPrice = $item->variant ? $item->variant->additional_price : 0;
                $itemPrice = $priceAfterDiscount + $variantPrice;
                $totalAmount += $itemPrice * $item->quantity;
            }

            if ($totalAmount < 100000) {
                $totalAmount += 10000;
            }
            // Midtrans configuration
            Config::$serverKey = config('midtrans.serverKey');
            Config::$isProduction = false;
            Config::$isSanitized = true;
            Config::$is3ds = true;

            // Generate unique order ID
            $orderId = 'ORDER-' . time() . '-' . rand(1000, 9999);

            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $totalAmount,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '08111222333',
                ],
                'expiry' => [
                    'start_time' => date('Y-m-d H:i:s O'),
                    'unit' => 'hours',
                    'duration' => 24 // Expired dalam 24 jam
                ],
                'callbacks' => [
            'finish' => "http://localhost:3000",
        ],
            ];

            $snapToken = Snap::getSnapToken($params);

            // Create order dengan status pending
            $order = Order::create([
                'user_id' => $user->id,
                'order_id' => $orderId,
                'total_amount' => $totalAmount,
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'shipping_address' => $request->shipping_address,
                'snap_token' => $snapToken,
            ]);

            // Create order items
            foreach ($cartItems as $item) {
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

            // CART TETAP STATUS PENDING (tidak diubah di sini)

            $order->load(['items.product', 'items.variant']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully. Please complete the payment.',
                'data' => [
                    'order' => $order,
                    'snap_token' => $snapToken,
                    'payment_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken
                ]
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

    public function handleWebhook(Request $request)
    {
        try {
            $notification = $request->all();
            
            Log::info('Midtrans Webhook Received:', $notification);

            $orderId = $notification['order_id'];
            $transactionStatus = $notification['transaction_status'];
            $fraudStatus = $notification['fraud_status'] ?? null;

            // Cari order berdasarkan order_id
            $order = Order::where('order_id', $orderId)->first();

            if (!$order) {
                Log::error('Order not found for order_id: ' . $orderId);
                return response()->json(['message' => 'Order not found'], 404);
            }

            // Handle transaction status
            switch ($transactionStatus) {
                case 'capture':
                    if ($fraudStatus == 'challenge') {
                        $order->update(['payment_status' => 'pending']);
                    } else if ($fraudStatus == 'accept') {
                        $this->handlePaymentSuccess($order);
                    }
                    break;

                case 'settlement':
                    $this->handlePaymentSuccess($order);
                    break;

                case 'pending':
                    $order->update(['payment_status' => 'pending']);
                    break;

                case 'deny':
                case 'cancel':
                case 'expire':
                    $this->handlePaymentFailure($order, $transactionStatus);
                    break;
            }

            Log::info('Webhook processed successfully for order: ' . $orderId);

            return response()->json(['message' => 'Webhook processed successfully']);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }

    private function handlePaymentSuccess(Order $order)
    {
        DB::transaction(function () use ($order) {
            // Update order status to paid
            $order->update(['payment_status' => 'paid']);

            // Update cart status to checked_out
            Cart::where('user_id', $order->user_id)
                ->where('status', 'pending')
                ->update(['status' => 'checked_out']);

            // Kurangi stok produk
            $this->reduceProductStock($order);
        });

        Log::info('Payment success for order: ' . $order->order_id);
    }

    private function handlePaymentFailure(Order $order, $status)
    {
        // Update order status to failed/expired
        $order->update(['payment_status' => $status]);

        // CART TETAP PENDING (user bisa coba checkout lagi)

        Log::info('Payment failed for order: ' . $order->order_id . ' with status: ' . $status);
    }

    /**
     * Kurangi stok produk berdasarkan order items
     */
    private function reduceProductStock(Order $order)
    {
        try {
            // Ambil semua order items dengan product
            $orderItems = OrderItem::with('product')
                ->where('order_id', $order->id)
                ->get();

            foreach ($orderItems as $item) {
                $product = $item->product;
                
                if ($product) {
                    if ($product->stock >= $item->quantity) {
                        $product->decrement('stock', $item->quantity);
                        Log::info("Reduced stock for product {$product->id} by {$item->quantity}. Remaining stock: {$product->stock}");
                    } else {
                        Log::warning("Insufficient stock for product {$product->id}. Requested: {$item->quantity}, Available: {$product->stock}");
                    }
                }
            }

            Log::info('Product stock reduced successfully for order: ' . $order->order_id);

        } catch (\Exception $e) {
            Log::error('Failed to reduce product stock for order: ' . $order->order_id . '. Error: ' . $e->getMessage());
            throw $e; 
        }
    }
}