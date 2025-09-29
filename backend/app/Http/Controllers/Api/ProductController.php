<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{

    public function index(){
        $products = Product::all();
        return response()->json([
            'message' => 'success',
            'data' => $products->load('variants')
        ], 200);
    }

    
    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'slug' => 'required|string|max:255|unique:products,slug',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg|max:20048',
        'price' => 'required|numeric|min:0',
        'discount' => 'nullable|numeric|min:0|max:100',
        'stock' => 'required|integer|min:0',
        'category' => 'required|exists:categories,id',
        'variants' => 'nullable|array',
        'variants.*.name' => 'required_with:variants|string|max:255',
        'variants.*.additional_price' => 'required_with:variants|numeric|min:0',
    ]);

    $imagePath = null;

    if ($request->hasFile('image')) {
        $imagePath = $request->file('image')->store('products', 'public');
    }

    $product = new Product();
    $product->name = $request->name;
    $product->slug = $request->slug;
    $product->description = $request->description;
    $product->image = $imagePath;
    $product->price = $request->price;
    $product->discount = $request->discount ?? 0;
    $product->stock = $request->stock;
    $product->category_id = $request->category;
    $product->save();

    if ($request->has('variants') && !empty($request->variants)) {
        foreach ($request->variants as $variantData) {
            if (empty($variantData['name'])) {
                continue;
            }

            $variant = new ProductVariant();
            $variant->name = $variantData['name'];
            $variant->additional_price = $variantData['additional_price'] ?? 0;
            $variant->product_id = $product->id;
            $variant->save();
        }
    }

    return response()->json([
        'message' => 'Product created successfully',
        'data' => $product->load('variants') // kalau ada relasi variants di model Product
    ], 201);
}


public function show(string $slug)
{
    $product = Product::with('variants', 'category') // ikutkan relasi
        ->where('slug', $slug)
        ->first();

    if (!$product) {
        return response()->json([
            'message' => 'Product not found'
        ], 404);
    }

    return response()->json([
        'message' => 'Product retrieved successfully',
        'data' => $product
    ], 200);
}

public function edit(string $slug)
{
    $product = Product::with('variants', 'category') 
        ->where('slug', $slug)
        ->first();

    if (!$product) {
        return response()->json([
            'message' => 'Product not found'
        ], 404);
    }

    return response()->json([
        'message' => 'Product retrieved successfully',
        'data' => $product
    ], 200);
}

 public function update(Request $request, string $id)
{
    $product = Product::findOrFail($id);

    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg|max:20048', // 20MB
        'price' => 'required|numeric|min:0',
        'discount' => 'nullable|numeric|min:0|max:100',
        'stock' => 'required|integer|min:0',
        'category' => 'required',
        'variants' => 'nullable|array',
        'variants.*.name' => 'required_with:variants|string|max:255',
        'variants.*.additional_price' => 'required_with:variants|numeric|min:0',
        'new_variants' => 'nullable|array',
        'new_variants.*.name' => 'required_with:new_variants|string|max:255',
        'new_variants.*.additional_price' => 'required_with:new_variants|numeric|min:0',
        'deleted_variants' => 'nullable|array',
        'deleted_variants.*' => 'exists:product_variants,id',
    ]);

    // Handle image upload
    if ($request->hasFile('image')) {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        $path = $request->file('image')->store('products', 'public');
        $product->image = $path;
    }

    // Update product details
    $product->name = $request->name;
    $product->slug = $request->slug ?? Str::slug($request->name);
    $product->description = $request->description;
    $product->price = $request->price;
    $product->discount = $request->discount ?? 0;
    $product->stock = $request->stock;
    $product->category_id = $request->category;
    $product->save();

    // Handle deleted variants
    if ($request->has('deleted_variants')) {
        foreach ($request->deleted_variants as $deletedVariantId) {
            $variant = ProductVariant::find($deletedVariantId);
            if ($variant && $variant->product_id == $product->id) {
                $variant->delete();
            }
        }
    }

    // Update existing variants
    if ($request->has('variants')) {
        foreach ($request->variants as $variantId => $variantData) {
            // Skip if variant is marked for deletion
            if ($request->has('deleted_variants') && in_array($variantId, $request->deleted_variants)) {
                continue;
            }
            
            $variant = ProductVariant::find($variantId);
            if ($variant && $variant->product_id == $product->id) {
                $variant->name = $variantData['name'];
                $variant->additional_price = $variantData['additional_price'] ?? 0;
                $variant->save();
            }
        }
    }

    // Add new variants
    if ($request->has('new_variants')) {
        foreach ($request->new_variants as $newVariantData) {
            if (!empty($newVariantData['name'])) {
                $variant = new ProductVariant();
                $variant->name = $newVariantData['name'];
                $variant->additional_price = $newVariantData['additional_price'] ?? 0;
                $variant->product_id = $product->id;
                $variant->save();
            }
        }
    }

    return response()->json([
        'status' => 'success',
        'message' => 'Product updated successfully',
        'data' => $product->load('variants'),
    ], 200);
}



}
