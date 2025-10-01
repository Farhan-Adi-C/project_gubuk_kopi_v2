<?php

namespace App\Http\Controllers\Api;

use App\Models\Blog;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Number;
use App\Http\Controllers\Controller;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blogs = Blog::all();

        return response()->json([
            'status' => 'success',
            'message' => 'get all blogs successfully',
            'data' => $blogs
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required'
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blogs', 'public');
        }

        $blog = Blog::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title, '_') . "_" . rand(1000, 9999) . "_" . Str::random(8),
            'content' => $request->content,
            'image' => $imagePath ?? null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'success create blog',
            'data' => $blog
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $blog = Blog::where('slug', $slug)->first();

        if (!isset($blog)) {
            return response()->json([
                'status' => 'failed',
                'message' => 'blog not found'
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'success get blog by id',
            'data' => $blog
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $slug)
    {
        $blog = Blog::where('slug', $slug)->first();
        if (!isset($blog)) {
            return response()->json([
                'status' => 'failed',
                'message' => 'blog not found'
            ]);
        }
        $currentImage = $blog->image;

        $request->validate([
            'title' => 'required|string',
            'content' => 'required'
        ]);

        if ($request->hasFile('image')) {
            $imageLatest = $request->file('image')->store('blogs', 'public');
        }


        $blog->update([
            'title' => $request->title,
            'slug' =>Str::slug($request->title, '_') . "_" . rand(1000, 9999) . "_" . Str::random(8), 
            'content' => $request->content,
            'image' => $imageLatest
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'success updated blog',
            'data' => $blog
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $slug)
    {
        Blog::where('slug', $slug)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'success deleted blog',
        ]);
    }
}
