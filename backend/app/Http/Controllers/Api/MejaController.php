<?php

namespace App\Http\Controllers\Api;

use App\Models\Meja;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class MejaController extends Controller
{
     public function index()
    {
        try {
            $mejas = Meja::all();
            
            return response()->json([
                'success' => true,
                'data' => $mejas
            ], Response::HTTP_OK);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve mejas',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'table_number' => 'required|string|unique:mejas,table_number',
                'capacity' => 'nullable|integer|min:1',
                'status' => 'nullable|in:available,reserved'
            ]);

            $meja = Meja::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Meja created successfully',
                'data' => $meja
            ], Response::HTTP_CREATED);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create meja',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $meja = Meja::find($id);

            if (!$meja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meja not found'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'data' => $meja
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve meja',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $meja = Meja::find($id);

            if (!$meja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meja not found'
                ], Response::HTTP_NOT_FOUND);
            }

            $validated = $request->validate([
                'table_number' => [
                    'sometimes',
                    'string',
                    Rule::unique('mejas', 'table_number')->ignore($meja->id)
                ],
                'capacity' => 'nullable|integer|min:1',
                'status' => 'nullable|in:available,reserved'
            ]);

            $meja->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Meja updated successfully',
                'data' => $meja
            ], Response::HTTP_OK);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update meja',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $meja = Meja::find($id);

            if (!$meja) {
                return response()->json([
                    'success' => false,
                    'message' => 'Meja not found'
                ], Response::HTTP_NOT_FOUND);
            }

            $meja->delete();

            return response()->json([
                'success' => true,
                'message' => 'Meja deleted successfully'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete meja',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available mejas
     */
    public function available()
    {
        try {
            $mejas = Meja::where('status', 'available')->get();

            return response()->json([
                'success' => true,
                'data' => $mejas
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available mejas',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get reserved mejas
     */
    public function reserved()
    {
        try {
            $mejas = Meja::where('status', 'reserved')->get();

            return response()->json([
                'success' => true,
                'data' => $mejas
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reserved mejas',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
