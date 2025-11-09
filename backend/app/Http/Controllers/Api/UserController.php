<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\File;

class UserController extends Controller
{
    public function index()
    {
        try {
            $user = User::all();
            return response()->json([
                'success' => true,
                'message' => 'user retrived succesfully',
                'data' => $user
            ],200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e
            ],500);
        }
    }

    public function create(Request $request)
    {
         $request->validate([
            'name' => 'required',
            'email' => 'required',
            'password' => 'required'
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'user sukses ditambahkan',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e
            ],500);
        }
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
    
    public function delete($id)
    {
        try {
            $user = User::findOrFail($id);

            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully',
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'User not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function getAllUser()
{
    try {
        $users = User::with(['carts', 'orders'])
                    ->select(['id', 'name', 'email', 'is_admin', 'email_verified_at', 'created_at'])
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
}
