<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use PhpParser\Node\Stmt\TryCatch;

class ContactMessageController extends Controller
{
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'message' => 'required'
        ]);

        Contact::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Send message success'
        ]);
    }

    public function getMessage(){
        try {
        $data = Contact::all();

        return response()->json([
            'success' => true,
            'data' => $data
        ],200);
        } catch (\Exception $e) {
             return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve message',
            'error' => $e->getMessage()
        ], 500);
        }

    }

}
