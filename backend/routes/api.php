<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index'])->middleware('auth:sanctum');
Route::post('/products/create', [ProductController::class, 'store'])->middleware('auth:sanctum');
Route::get('/products/{slug}', [ProductController::class, 'show'])->middleware('auth:sanctum');
Route::get('/products/edit/{slug}', [ProductController::class, 'edit'])->middleware('auth:sanctum');
Route::post('/products/update/{slug}', [ProductController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/products/delete/{slug}', [ProductController::class, 'destroy'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::post('/', [CategoryController::class, 'store'])->name('api.categories.store');
    Route::get('/{id}', [CategoryController::class, 'show'])->name('api.categories.show');
    Route::post('/{id}', [CategoryController::class, 'update'])->name('api.categories.update');
    Route::delete('/{id}', [CategoryController::class, 'destroy'])->name('api.categories.destroy');
});

Route::middleware('auth:sanctum')->prefix('blogs')->group(function (){
    Route::get('/', [BlogController::class,'index'])->name('api.blogs.index');
    Route::post('/', [BlogController::class,'store'])->name('api.blogs.store');
    Route::get('/{slug}', [BlogController::class,'show'])->name('api.blogs.show');
    Route::post('/{slug}', [BlogController::class,'update'])->name('api.blogs.update');
    Route::delete('/{slug}', [BlogController::class,'destroy'])->name('api.blogs.destroy');

});


Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth:sanctum');
