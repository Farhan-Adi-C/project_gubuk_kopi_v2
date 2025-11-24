<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->bigInteger('total_amount')->default(0);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('snap_token')->nullable();
            $table->enum('order_type', ['delivery', 'takeaway', 'dinein'])->default('dinein');
            $table->foreignId('meja_id')->nullable()->constrained('mejas')->nullOnDelete();
            $table->longText('shipping_address')->nullable();
            $table->string('pickup_time')->nullable();

              $table->enum('order_status', [
                'pending',
                'processed',
                'completed',
                'cancelled',

                'courier_assigned',
                'picked_by_courier',
                'on_the_way',
                'delivered',
            ])->default('pending');

            $table->json('status_timestamps')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
