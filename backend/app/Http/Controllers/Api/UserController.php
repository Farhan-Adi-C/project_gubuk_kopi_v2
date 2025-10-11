<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\File;

class UserController extends Controller
{
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
}
