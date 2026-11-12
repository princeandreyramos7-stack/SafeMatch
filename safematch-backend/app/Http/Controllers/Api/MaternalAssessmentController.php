<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaternalAssessment;
use App\Models\Mother;
use App\Models\MaternalAssessmentType;
use Illuminate\Http\Request;

class MaternalAssessmentController extends Controller
{
    /**
     * Get all assessments with filters.
     */
    public function index(Request $request)
    {
        $query = MaternalAssessment::with([
            'mother',
            'assessmentType',
            'assessedBy'
        ])->latest('assessment_date');

        // Filter by mother
        if ($request->has('mother_id')) {
            $query->where('mother_id', $request->mother_id);
        }

        // Filter by assessment type
        if ($request->has('assessment_type_id')) {
            $query->where('assessment_type_id', $request->assessment_type_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('mother', function ($q) use ($search) {
                $q->where('mother_id', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        // Date range
        if ($request->has('date_from')) {
            $query->whereDate('assessment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('assessment_date', '<=', $request->date_to);
        }

        $assessments = $query->paginate(20);

        return response()->json($assessments);
    }

    /**
     * Get assessments for a specific mother.
     */
    public function getByMother($motherId)
    {
        $mother = Mother::findOrFail($motherId);

        $assessments = MaternalAssessment::with([
            'assessmentType',
            'assessedBy'
        ])
            ->where('mother_id', $motherId)
            ->latest('assessment_date')
            ->get();

        return response()->json([
            'mother' => $mother,
            'assessments' => $assessments,
        ]);
    }

    /**
     * Store a new assessment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mother_id' => 'required|exists:mothers,id',
            'assessment_type_id' => 'required|exists:maternal_assessment_types,id',
            'assessment_date' => 'required|date',
            'status' => 'required|in:normal,abnormal,requires_attention,critical',
            'findings' => 'nullable|json',
            'notes' => 'nullable|string',
        ]);

        $validated['assessed_by'] = $request->user()->id;

        $assessment = MaternalAssessment::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessment)
            ->withProperties([
                'mother_id' => $assessment->mother->mother_id,
                'assessment_type' => $assessment->assessmentType->name,
                'status' => $validated['status'],
            ])
            ->log('Recorded maternal assessment');

        return response()->json([
            'message' => 'Assessment recorded successfully',
            'assessment' => $assessment->load(['mother', 'assessmentType', 'assessedBy']),
        ], 201);
    }

    /**
     * Get a single assessment.
     */
    public function show($id)
    {
        $assessment = MaternalAssessment::with([
            'mother',
            'assessmentType',
            'assessedBy'
        ])->findOrFail($id);

        return response()->json($assessment);
    }

    /**
     * Update an assessment.
     */
    public function update(Request $request, $id)
    {
        $assessment = MaternalAssessment::findOrFail($id);

        $validated = $request->validate([
            'assessment_type_id' => 'sometimes|required|exists:maternal_assessment_types,id',
            'assessment_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:normal,abnormal,requires_attention,critical',
            'findings' => 'nullable|json',
            'notes' => 'nullable|string',
        ]);

        $assessment->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($assessment)
            ->withProperties([
                'mother_id' => $assessment->mother->mother_id,
                'assessment_type' => $assessment->assessmentType->name,
            ])
            ->log('Updated maternal assessment');

        return response()->json([
            'message' => 'Assessment updated successfully',
            'assessment' => $assessment->load(['mother', 'assessmentType', 'assessedBy']),
        ]);
    }

    /**
     * Delete an assessment.
     */
    public function destroy(Request $request, $id)
    {
        $assessment = MaternalAssessment::findOrFail($id);

        // Store info for logging
        $motherId = $assessment->mother->mother_id;
        $assessmentTypeName = $assessment->assessmentType->name;

        $assessment->delete();

        // Log activity
        activity()
            ->causedBy($request->user())
            ->withProperties([
                'mother_id' => $motherId,
                'assessment_type' => $assessmentTypeName,
            ])
            ->log('Deleted maternal assessment');

        return response()->json([
            'message' => 'Assessment deleted successfully',
        ]);
    }

    /**
     * Get assessment statistics.
     */
    public function statistics()
    {
        $stats = [
            'total_assessments' => MaternalAssessment::count(),
            'by_status' => [
                'normal' => MaternalAssessment::where('status', 'normal')->count(),
                'abnormal' => MaternalAssessment::where('status', 'abnormal')->count(),
                'requires_attention' => MaternalAssessment::where('status', 'requires_attention')->count(),
                'critical' => MaternalAssessment::where('status', 'critical')->count(),
            ],
            'today' => MaternalAssessment::whereDate('assessment_date', today())->count(),
            'this_week' => MaternalAssessment::whereBetween('assessment_date', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => MaternalAssessment::whereMonth('assessment_date', now()->month)
                ->whereYear('assessment_date', now()->year)
                ->count(),
            'critical_last_24h' => MaternalAssessment::where('status', 'critical')
                ->where('assessment_date', '>=', now()->subHours(24))
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get assessment completion rate by mother.
     */
    public function completionRate($motherId)
    {
        $mother = Mother::findOrFail($motherId);
        
        // Calculate days since admission
        $daysSinceAdmission = $mother->admission_date
            ? now()->diffInDays($mother->admission_date)
            : 0;

        // Get mandatory assessment types
        $mandatoryTypes = MaternalAssessmentType::where('is_mandatory', true)
            ->where('is_active', true)
            ->get();

        $expectedAssessments = 0;
        $completedAssessments = 0;

        foreach ($mandatoryTypes as $type) {
            if ($type->frequency_hours && $daysSinceAdmission > 0) {
                // Calculate expected assessments based on frequency
                $expectedCount = ceil(($daysSinceAdmission * 24) / $type->frequency_hours);
                $expectedAssessments += $expectedCount;

                // Count actual assessments
                $actualCount = MaternalAssessment::where('mother_id', $motherId)
                    ->where('assessment_type_id', $type->id)
                    ->count();
                $completedAssessments += min($actualCount, $expectedCount);
            }
        }

        $completionRate = $expectedAssessments > 0
            ? round(($completedAssessments / $expectedAssessments) * 100, 2)
            : 100;

        return response()->json([
            'mother' => $mother,
            'days_since_admission' => $daysSinceAdmission,
            'expected_assessments' => $expectedAssessments,
            'completed_assessments' => $completedAssessments,
            'completion_rate' => $completionRate,
        ]);
    }
}
