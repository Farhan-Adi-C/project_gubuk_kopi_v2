<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products/create', [ProductController::class, 'store']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/edit/{slug}', [ProductController::class, 'edit']);
Route::post('/products/update/{id}', [ProductController::class, 'update']);

