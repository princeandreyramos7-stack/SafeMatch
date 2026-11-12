<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewbornScreeningType;
use Illuminate\Http\Request;

class NewbornScreeningTypeController extends Controller
{
    /**
     * Get all screening types.
     */
    public function index(Request $request)
    {
        $query = NewbornScreeningType::query();

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $screeningTypes = $query->orderBy('name')->get();

        return response()->json($screeningTypes);
    }

    /**
     * Create a new screening type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:newborn_screening_types,name',
            'description' => 'nullable|string',
            'typical_timeframe' => 'nullable|string|max:100',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $screeningType = NewbornScreeningType::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screeningType)
            ->log('Created screening type');

        return response()->json([
            'message' => 'Screening type created successfully',
            'screening_type' => $screeningType,
        ], 201);
    }

    /**
     * Update a screening type.
     */
    public function update(Request $request, $id)
    {
        $screeningType = NewbornScreeningType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:newborn_screening_types,name,' . $id,
            'description' => 'nullable|string',
            'typical_timeframe' => 'nullable|string|max:100',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $screeningType->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screeningType)
            ->log('Updated screening type');

        return response()->json([
            'message' => 'Screening type updated successfully',
            'screening_type' => $screeningType,
        ]);
    }

    /**
     * Delete a screening type.
     */
    public function destroy(Request $request, $id)
    {
        $screeningType = NewbornScreeningType::findOrFail($id);

        // Check if there are any screenings using this type
        $screeningsCount = $screeningType->screenings()->count();
        if ($screeningsCount > 0) {
            return response()->json([
                'message' => "Cannot delete screening type. It is used in {$screeningsCount} screening record(s).",
            ], 422);
        }

        $screeningType->delete();

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screeningType)
            ->log('Deleted screening type');

        return response()->json([
            'message' => 'Screening type deleted successfully',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Request $request, $id)
    {
        $screeningType = NewbornScreeningType::findOrFail($id);
        
        $screeningType->update([
            'is_active' => !$screeningType->is_active,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screeningType)
            ->log($screeningType->is_active ? 'Activated screening type' : 'Deactivated screening type');

        return response()->json([
            'message' => 'Screening type status updated successfully',
            'screening_type' => $screeningType,
        ]);
    }
}
