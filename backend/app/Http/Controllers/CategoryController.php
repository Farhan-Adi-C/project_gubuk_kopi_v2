<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
   
    public function index() 
    {
        
        $categories = Category::all();

        return view('dashboard.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('dashboard.categories.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required'
        ]);

        if($request->hasFile('image')){
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $category = new Category();
        $category->name = $request->name;
        $category->image = $imagePath ?? null;
        $category->save();

        return redirect()->route('category.index');
    }

   
    public function show(string $id)
    {
        
    }

    public function edit(string $id)
    {
        [$category] = Category::where('id', $id)->get();

        return view('dashboard.categories.edit', compact('category'));
    }

    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $category->name = $request->name;
        if($request->hasFile('image')){
            $imagePath = $request->file('image')->store('category', 'public');
            $category->image = $imagePath;
        }

        $category->save();

        return redirect()->route('category.index');
    }

    public function destroy(string $id)
    {
        Category::where('id', $id)->delete();

        return redirect()->back();
    }
}
