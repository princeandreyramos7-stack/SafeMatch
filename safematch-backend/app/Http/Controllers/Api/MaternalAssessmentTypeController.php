<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaternalAssessmentType;
use Illuminate\Http\Request;

class MaternalAssessmentTypeController extends Controller
{
    /**
     * Get all assessment types.
     */
    public function index(Request $request)
    {
        $query = MaternalAssessmentType::query();

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

        $assessmentTypes = $query->orderBy('name')->get();

        return response()->json($assessmentTypes);
    }

    /**
     * Create a new assessment type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:maternal_assessment_types,name',
            'description' => 'nullable|string',
            'frequency_hours' => 'nullable|integer|min:1',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $assessmentType = MaternalAssessmentType::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessmentType)
            ->log('Created maternal assessment type');

        return response()->json([
            'message' => 'Assessment type created successfully',
            'assessment_type' => $assessmentType,
        ], 201);
    }

    /**
     * Update an assessment type.
     */
    public function update(Request $request, $id)
    {
        $assessmentType = MaternalAssessmentType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:maternal_assessment_types,name,' . $id,
            'description' => 'nullable|string',
            'frequency_hours' => 'nullable|integer|min:1',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $assessmentType->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessmentType)
            ->log('Updated maternal assessment type');

        return response()->json([
            'message' => 'Assessment type updated successfully',
            'assessment_type' => $assessmentType,
        ]);
    }

    /**
     * Delete an assessment type.
     */
    public function destroy(Request $request, $id)
    {
        $assessmentType = MaternalAssessmentType::findOrFail($id);

        // Check if there are any assessments using this type
        $assessmentsCount = $assessmentType->assessments()->count();
        if ($assessmentsCount > 0) {
            return response()->json([
                'message' => "Cannot delete assessment type. It is used in {$assessmentsCount} assessment record(s).",
            ], 422);
        }

        $assessmentType->delete();

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessmentType)
            ->log('Deleted maternal assessment type');

        return response()->json([
            'message' => 'Assessment type deleted successfully',
        ]);
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Request $request, $id)
    {
        $assessmentType = MaternalAssessmentType::findOrFail($id);
        
        $assessmentType->update([
            'is_active' => !$assessmentType->is_active,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessmentType)
            ->log($assessmentType->is_active ? 'Activated assessment type' : 'Deactivated assessment type');

        return response()->json([
            'message' => 'Assessment type status updated successfully',
            'assessment_type' => $assessmentType,
        ]);
    }
}
