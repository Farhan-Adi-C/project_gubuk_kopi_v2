<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Exception\ClientException;

class AuthController extends Controller
{
    public function register(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' =>  'required|string|min:6|confirmed',
        ]);

         $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken($request->name)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 201);

    }

    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!auth()->attempt($request->only('email', 'password'))) {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid credentials'
        ], 401);
    }

    $user = User::where('email', $request->email)->first();

    return response()->json([
        'status' => 'success',
        'message' => 'Login success',
        'access_token' => $user->createToken('auth_token')->plainTextToken,
        'token_type' => 'Bearer'
    ]);
}

public function userIsLogin(Request $request){
    return response()->json([
        'status' => 'success',
        'user' => $request->user(),
    ]);
}

public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'status' => 'success',
        'message' => 'Logged out successfully'
    ]);
}

public function redirectToAuth()
{
       
        return response()->json([
            'url' => Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl(),
        ]);
}

public function handleAuthCallback()
    {
        try {
            $socialiteUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            Log::error($e);
            return response()->json([
                'success' => false,
                'message' => 'Login gagal, kredensial tidak valid.'
            ], 422);
        }

        
        $user = User::updateOrCreate(
        ['email' => $socialiteUser->getEmail()],
        [
            'name' => $socialiteUser->getName(),
            'google_id' => $socialiteUser->getId(),
            'avatar' => $socialiteUser->getAvatar(),
        ]
        );

        return response()->json([
            'success' => true,
            'user' => $user,
            'access_token' => $user->createToken('auth-token')->plainTextToken,
            'token_type' => 'Bearer',
        ]);


    }
}
