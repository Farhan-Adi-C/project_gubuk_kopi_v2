<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\File;
use Illuminate\Support\Facades\Storage;
use SebastianBergmann\CodeUnit\FunctionUnit;

class UserController extends Controller
{

    public function edit($id)
    {
        $user = User::findOrFail($id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User fetched successfully',
            'data' => $user,
        ], 200);
    }


     public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
            'old_password' => ['nullable', 'string'],
            'avatar' => ['nullable', File::image()->max(2048)], 
        ]);

        
        if ($request->filled('name')) {
            $user->name = $validated['name'];
        }

       
        if ($request->filled('password')) {
            
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Old password is incorrect.'
                ], 422);
            }

            $user->password = Hash::make($validated['password']);
        }

        
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'data' => $user,
        ]);
    }

    public function getAllUser()
    {
        try {
            $users = User::select(['id', 'avatar','name', 'email','google_id', 'is_admin', 'email_verified_at', 'created_at'])
                        ->get();
            
            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users retrieved successfully'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable|image',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $avatarPath, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully'
        ], 201);

    }

    public function delete($id)
    {
            $user = User::findOrFail($id);

            
            if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                $avatarPath = 'public/' . $user->avatar; 

                if (Storage::exists($avatarPath)) {
                    Storage::delete($avatarPath);
                }
            }
            
            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);
    }

}
