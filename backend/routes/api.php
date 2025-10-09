<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products/create', [ProductController::class, 'store']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/edit/{slug}', [ProductController::class, 'edit']);
Route::post('/products/update/{slug}', [ProductController::class, 'update']);
Route::delete('/products/delete/{slug}', [ProductController::class, 'destroy']);

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::post('/', [CategoryController::class, 'store'])->name('api.categories.store');
    Route::get('/{id}', [CategoryController::class, 'show'])->name('api.categories.show');
    Route::post('/{id}', [CategoryController::class, 'update'])->name('api.categories.update');
    Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('api.categories.destroy');
});

Route::prefix('blogs')->group(function (){
    Route::get('/', [BlogController::class,'index'])->name('api.blogs.index');
    Route::post('/', [BlogController::class,'store'])->name('api.blogs.store');
    Route::get('/{slug}', [BlogController::class,'show'])->name('api.blogs.show');
    Route::post('/{slug}', [BlogController::class,'update'])->name('api.blogs.update');
    Route::delete('/{slug}', [BlogController::class,'destroy'])->name('api.blogs.destroy');

});

  Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
        Route::post('/add', [CartController::class, 'addToCart']);
        Route::get('/', [CartController::class, 'getCart']);
        Route::put('/update/{cartId}', [CartController::class, 'updateCartQuantity']);
        Route::delete('/remove/{cartId}', [CartController::class, 'removeFromCart']);
    });

    Route::post('/checkout', [OrderController::class, 'checkout'])->middleware('auth:sanctum');
    Route::get('/orders/history', [OrderController::class, 'getOrderHistory'])->middleware('auth:sanctum');


Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->get('/userislogin', [AuthController::class, 'userIsLogin']);
