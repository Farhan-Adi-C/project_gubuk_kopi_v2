<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function getMessage(Request $request)
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
}
