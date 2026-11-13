<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DischargeRequirement;
use Illuminate\Http\Request;

class DischargeRequirementController extends Controller
{
    /**
     * Get all discharge requirements.
     */
    public function index(Request $request)
    {
        $query = DischargeRequirement::query();

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filter by requirement_type
        if ($request->has('requirement_type')) {
            $query->where('requirement_type', $request->requirement_type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $requirements = $query->orderBy('requirement_type')->orderBy('display_order')->orderBy('name')->get();

        return response()->json($requirements);
    }

    /**
     * Create a new requirement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'requirement_type' => 'required|in:maternal,newborn',
            'description' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        $requirement = DischargeRequirement::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($requirement)
            ->log('Created discharge requirement');

        return response()->json([
            'message' => 'Discharge requirement created successfully',
            'requirement' => $requirement,
        ], 201);
    }

    /**
     * Update a requirement.
     */
    public function update(Request $request, $id)
    {
        $requirement = DischargeRequirement::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'requirement_type' => 'sometimes|required|in:maternal,newborn',
            'description' => 'nullable|string',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
        ]);

        $requirement->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($requirement)
            ->log('Updated discharge requirement');

        return response()->json([
            'message' => 'Discharge requirement updated successfully',
            'requirement' => $requirement,
        ]);
    }

    /**
     * Delete a requirement.
     */
    public function destroy(Request $request, $id)
    {
        $requirement = DischargeRequirement::findOrFail($id);

        // Check if there are any discharge records using this requirement
        $recordsCount = $requirement->dischargeRecords()->count();
        if ($recordsCount > 0) {
            return response()->json([
                'message' => "Cannot delete requirement. It is used in {$recordsCount} discharge record(s).",
            ], 422);
        }

        $requirement->delete();

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($requirement)
            ->log('Deleted discharge requirement');

        return response()->json([
            'message' => 'Discharge requirement deleted successfully',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Request $request, $id)
    {
        $requirement = DischargeRequirement::findOrFail($id);
        
        $requirement->update([
            'is_active' => !$requirement->is_active,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($requirement)
            ->log($requirement->is_active ? 'Activated discharge requirement' : 'Deactivated discharge requirement');

        return response()->json([
            'message' => 'Discharge requirement status updated successfully',
            'requirement' => $requirement,
        ]);
    }
}
