<?php

namespace App\Http\Controllers\Api;

use Midtrans\Snap;
use App\Models\Cart;
use App\Models\Meja;
use Midtrans\Config;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

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
        'order_type' => 'required|in:delivery,takeaway,dinein',
        'shipping_address' => 'required_if:order_type,delivery|string|nullable',
        'shipping_cost' => 'required_if:order_type,delivery|numeric|min:0',
        'meja_id' => 'required_if:order_type,dinein|exists:mejas,id|nullable',
        'pickup_time' => 'required_if:order_type,takeaway|string|nullable',
        'payment_method' => 'required|in:midtrans,cash',
    ]);

    DB::beginTransaction();

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

        // Jika order type dinein, update status meja menjadi reserved
        if ($request->order_type === 'dinein' && $request->meja_id) {
            $meja = Meja::find($request->meja_id);
            
            if (!$meja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meja tidak ditemukan'
                ], 404);
            }
            
            if ($meja->status !== 'available') {
                return response()->json([
                    'success' => false,
                    'message' => 'Meja tidak tersedia'
                ], 400);
            }
            
            // Update status meja menjadi reserved
            $meja->status = 'reserved';
            $meja->save();
        }

        // Calculate total amount from cart items
        $totalAmount = 0;
        foreach ($cartItems as $item) {
            $discountAmount = intval($item->product->price * ($item->product->discount / 100));
            $priceAfterDiscount = intval($item->product->price - $discountAmount);
            $variantPrice = intval($item->variant ? $item->variant->additional_price : 0);
            $itemPrice = intval($priceAfterDiscount + $variantPrice);
            $totalAmount += intval($itemPrice * $item->quantity);
        }

        // Add shipping cost for delivery (langsung tambah ke total_amount)
        if ($request->order_type === 'delivery') {
            $shippingCost = intval($request->shipping_cost);
            $totalAmount += $shippingCost;
        }

        // Generate unique order ID
        $orderId = 'ORDER-' . time() . '-' . rand(1000, 9999);

        $orderData = [
            'user_id' => $user->id,
            'order_id' => $orderId,
            'total_amount' => $totalAmount,
            'payment_status' => 'pending',
            'payment_method' => $request->payment_method,
            'order_type' => $request->order_type,
            'shipping_address' => $request->shipping_address,
            'meja_id' => $request->meja_id,
            'pickup_time' => $request->pickup_time,
            'order_status' => 'pending',
            'status_timestamps' => $this->initializeStatusTimestamps()
        ];

        $snapToken = null;
        $paymentUrl = null;
        $message = 'Order created successfully.';

        // Handle payment based on payment method
        if ($request->payment_method === 'midtrans') {
            // Midtrans configuration
            Config::$serverKey = config('midtrans.serverKey');
            Config::$isProduction = config('midtrans.isProduction', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

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
                    'duration' => 24
                ],
                'callbacks' => [
                    'finish' => "http://localhost:3000/orderConfirmation/" . $orderId,
                ],
            ];

            $snapToken = Snap::getSnapToken($params);
            $orderData['snap_token'] = $snapToken;
            
            $paymentUrl = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken;
            $message = 'Order created successfully. Please complete the payment.';

        } else {
            // For cash payment
            $message = 'Order created successfully. Please pay with cash when order is ready.';
            
            Cart::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'checked_out']);
        }

        // Create order
        $order = Order::create($orderData);

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

        DB::commit();

        $order->load(['items.product', 'items.variant', 'meja']);

        // Send socket notification for new order
        $this->sendOrderNotification($order, 'new_order');

        $response = [
            'success' => true,
            'message' => $message,
            'data' => [
                'order' => $order,
                'order_id' => $order->order_id,
                'id' => $order->id,
            ]
        ];

        // Add payment data only for midtrans
        if ($request->payment_method === 'midtrans') {
            $response['data']['snap_token'] = $snapToken;
            $response['data']['payment_url'] = $paymentUrl;
        }

        return response()->json($response, 201);

    } catch (\Exception $e) {
        DB::rollBack();
        
        // Jika error terjadi dan meja sudah direserve, kembalikan status ke available
        if (isset($meja) && $meja->status === 'reserved') {
            try {
                $meja->status = 'available';
                $meja->save();
            } catch (\Exception $mejaError) {
                Log::error('Failed to revert meja status: ' . $mejaError->getMessage());
            }
        }
        
        Log::error('Checkout error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to create order',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function confirmCashPayment(Request $request, $orderId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        DB::beginTransaction();

        try {
            $order = Order::where('order_id', $orderId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            if ($order->payment_method !== 'cash') {
                return response()->json([
                    'success' => false,
                    'message' => 'This order is not using cash payment'
                ], 400);
            }

            if ($order->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment already processed'
                ], 400);
            }

            // Update order status to paid
            $order->update(['payment_status' => 'paid']);

            // **PERUBAHAN PENTING: Update cart status untuk cash payment**
            Cart::where('user_id', $user->id)
                ->where('status', 'pending')
                ->update(['status' => 'checked_out']);

            // Kurangi stok produk
            $this->reduceProductStock($order);

            DB::commit();

            $order->load(['items.product', 'items.variant', 'meja']);

            // Send socket notification for payment confirmation
            $this->sendOrderNotification($order, 'payment_confirmed');

            return response()->json([
                'success' => true,
                'message' => 'Cash payment confirmed successfully',
                'data' => $order
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Confirm cash payment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm cash payment',
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
            $orders = Order::with(['items.product', 'items.variant', 'meja'])
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

    public function getAllOrderHistory(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $orders = Order::with(['items.product', 'items.variant', 'user', 'meja'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'All order history retrieved successfully',
                'data' => $orders,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get all order history error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve all order history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getHistoryOrderByOrderId(Request $request, $order_id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $order = Order::with(['items.product', 'items.variant', 'user', 'meja'])
                ->where('order_id', $order_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'message' => 'Order history retrieved successfully',
                'data' => $order
            ], 200);
        } catch (\Exception $e) {
            Log::error('Get order by order_id error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
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

            // Skip processing if payment method is cash
            if ($order->payment_method === 'cash') {
                Log::info('Skipping webhook for cash payment order: ' . $orderId);
                return response()->json(['message' => 'Webhook skipped for cash payment'], 200);
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

            // **PERUBAHAN PENTING: Update cart status ketika pembayaran berhasil**
            Cart::where('user_id', $order->user_id)
                ->where('status', 'pending')
                ->update(['status' => 'checked_out']);

            // Kurangi stok produk
            $this->reduceProductStock($order);
        });

        // Send socket notification for successful payment
        $this->sendOrderNotification($order, 'payment_success');

        Log::info('Payment success for order: ' . $order->order_id);
    }

    private function handlePaymentFailure(Order $order, $status)
    {
        DB::transaction(function () use ($order, $status) {
            // Update order status to failed/expired
            $order->update(['payment_status' => $status]);

            Log::info('Payment failed for order: ' . $order->order_id . ' with status: ' . $status . '. Cart remains pending for retry.');
        });

        // Send socket notification for failed payment
        $this->sendOrderNotification($order, 'payment_failed');
    }

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
                        // You might want to handle this case differently, e.g., notify admin
                    }
                }
            }

            Log::info('Product stock reduced successfully for order: ' . $order->order_id);

        } catch (\Exception $e) {
            Log::error('Failed to reduce product stock for order: ' . $order->order_id . '. Error: ' . $e->getMessage());
            throw $e; 
        }
    }

    public function updatePaymentStatus(Request $request, $orderId)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,expired'
        ]);

        try {
            $order = Order::where('order_id', $orderId)->firstOrFail();

            DB::transaction(function () use ($order, $request) {
                $oldStatus = $order->payment_status;
                $newStatus = $request->payment_status;

                $order->update([
                    'payment_status' => $newStatus
                ]);

                // If status changed to paid and payment method is cash, reduce stock
                if ($newStatus === 'paid' && $oldStatus !== 'paid') {
                    // Kurangi stok produk
                    $this->reduceProductStock($order);
                }
            });

            $order->load(['items.product', 'items.variant', 'meja', 'user']);

            // Send socket notification for payment status update
            $this->sendOrderNotification($order, 'payment_status_updated');

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $order
            ], 200);

        } catch (\Exception $e) {
            Log::error('Update payment status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateOrderStatus(Request $request, $orderId)
    {
        $request->validate([
            'order_status' => 'required|in:pending,processed,completed,cancelled,courier_assigned,picked_by_courier,on_the_way,delivered'
        ]);

        try {
            $order = Order::where('order_id', $orderId)->firstOrFail();

            DB::transaction(function () use ($order, $request) {
                $oldStatus = $order->order_status;
                $newStatus = $request->order_status;

                // Update order status
                $order->update([
                    'order_status' => $newStatus
                ]);

                // Update status timestamps
                $this->updateStatusTimestamps($order, $newStatus);

                Log::info("Order status changed: {$order->order_id} from {$oldStatus} to {$newStatus}");
            });

            $order->load(['items.product', 'items.variant', 'meja', 'user']);

            // Send socket notification for order status update
            $this->sendOrderNotification($order, 'order_status_updated');

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order
            ], 200);

        } catch (\Exception $e) {
            Log::error('Update order status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order status timeline
     */
    public function getOrderTimeline(Request $request, $orderId)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            $order = Order::where('order_id', $orderId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $timeline = $this->buildStatusTimeline($order);

            return response()->json([
                'success' => true,
                'message' => 'Order timeline retrieved successfully',
                'data' => [
                    'order_id' => $order->order_id,
                    'current_status' => $order->order_status,
                    'timeline' => $timeline
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Get order timeline error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order timeline',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteOrder(Request $request, $orderId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        DB::beginTransaction();

        try {
            // Cari order berdasarkan order_id dan user_id (untuk keamanan)
            $order = Order::where('order_id', $orderId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            OrderItem::where('order_id', $order->id)->delete();

            // Hapus order
            $order->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully',
                'data' => [
                    'deleted_order_id' => $orderId
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin delete order - DIUBAH: Hapus validasi status
     */
    public function adminDeleteOrder(Request $request, $orderId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        DB::beginTransaction();

        try {
            $order = Order::where('order_id', $orderId)->firstOrFail();
            OrderItem::where('order_id', $order->id)->delete();

            // Hapus order
            $order->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully by admin',
                'data' => [
                    'deleted_order_id' => $orderId
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin delete order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send socket notification
     */
    private function sendOrderNotification(Order $order, string $type)
    {
        try {
            $notificationData = [
                'order' => $order->load(['items.product', 'items.variant', 'user', 'meja']),
                'type' => $type,
                'timestamp' => Carbon::now()->toISOString()
            ];

            Http::post(env('SOCKET_SERVER_URL') . '/broadcast-order', $notificationData);
            
            Log::info("Socket notification sent for order: {$order->order_id}, type: {$type}");

        } catch (\Exception $e) {
            Log::error("Failed to send order notification to socket: " . $e->getMessage());
            // Jangan throw exception agar tidak mengganggu flow utama
        }
    }

    private function initializeStatusTimestamps()
    {
        return [
            'pending' => Carbon::now()->toISOString()
        ];
    }

    private function updateStatusTimestamps(Order $order, string $newStatus)
    {
        $timestamps = $order->status_timestamps ?? [];
        $currentTime = Carbon::now()->toISOString();

        // Update timestamp for the new status
        $timestamps[$newStatus] = $currentTime;

        // Jika status adalah delivered, otomatis set completed
        if ($newStatus === 'delivered') {
            $timestamps['completed'] = $currentTime;
            $order->update(['order_status' => 'completed']);
        }

        $order->update(['status_timestamps' => $timestamps]);
    }

    /**
     * Build status timeline for response
     */
    private function buildStatusTimeline(Order $order)
    {
        $statusFlow = [
            'pending' => 'Order Placed',
            'processed' => 'Order Processed',
            'courier_assigned' => 'Courier Assigned',
            'picked_by_courier' => 'Picked by Courier',
            'on_the_way' => 'On the Way',
            'delivered' => 'Delivered',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled'
        ];

        $timeline = [];
        $timestamps = $order->status_timestamps ?? [];

        foreach ($statusFlow as $status => $description) {
            $timestamp = $timestamps[$status] ?? null;
            
            $timeline[] = [
                'status' => $status,
                'description' => $description,
                'timestamp' => $timestamp,
                'is_completed' => !is_null($timestamp),
                'is_current' => $order->order_status === $status
            ];
        }

        return $timeline;
    }
}