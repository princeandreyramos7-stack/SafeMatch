<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewbornScreening;
use App\Models\Newborn;
use App\Models\NewbornScreeningType;
use Illuminate\Http\Request;

class NewbornScreeningController extends Controller
{
    /**
     * Get all screenings with filters.
     */
    public function index(Request $request)
    {
        $query = NewbornScreening::with([
            'newborn.mother',
            'screeningType',
            'assignedPersonnel'
        ])->latest('performed_date');

        // Filter by newborn
        if ($request->has('newborn_id')) {
            $query->where('newborn_id', $request->newborn_id);
        }

        // Filter by screening type
        if ($request->has('screening_type_id')) {
            $query->where('screening_type_id', $request->screening_type_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by result
        if ($request->has('result') && $request->result !== 'all') {
            $query->where('result', $request->result);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('newborn', function ($q) use ($search) {
                $q->where('newborn_id', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        // Date range
        if ($request->has('date_from')) {
            $query->whereDate('performed_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('performed_date', '<=', $request->date_to);
        }

        $screenings = $query->paginate(20);

        return response()->json($screenings);
    }

    /**
     * Get screenings for a specific newborn.
     */
    public function getByNewborn($newbornId)
    {
        $newborn = Newborn::findOrFail($newbornId);

        $screenings = NewbornScreening::with([
            'screeningType',
            'assignedPersonnel'
        ])
            ->where('newborn_id', $newbornId)
            ->latest('performed_date')
            ->get();

        return response()->json([
            'newborn' => $newborn->load('mother'),
            'screenings' => $screenings,
        ]);
    }

    /**
     * Store a new screening.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'newborn_id' => 'required|exists:newborns,id',
            'screening_type_id' => 'required|exists:newborn_screening_types,id',
            'performed_date' => 'required|date',
            'status' => 'required|in:pending,scheduled,in_progress,completed,not_applicable,requires_followup',
            'result' => 'nullable|in:passed,failed,inconclusive,pending',
            'remarks' => 'nullable|string',
        ]);

        $validated['assigned_personnel_id'] = $request->user()->id;

        $screening = NewbornScreening::create($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screening)
            ->withProperties([
                'newborn_id' => $screening->newborn->newborn_id,
                'screening_type' => $screening->screeningType->name,
            ])
            ->log('Recorded newborn screening');

        return response()->json([
            'message' => 'Screening recorded successfully',
            'screening' => $screening->load(['newborn', 'screeningType', 'assignedPersonnel']),
        ], 201);
    }

    /**
     * Get a single screening.
     */
    public function show($id)
    {
        $screening = NewbornScreening::with([
            'newborn.mother',
            'screeningType',
            'assignedPersonnel'
        ])->findOrFail($id);

        return response()->json($screening);
    }

    /**
     * Update a screening.
     */
    public function update(Request $request, $id)
    {
        $screening = NewbornScreening::findOrFail($id);

        $validated = $request->validate([
            'screening_type_id' => 'sometimes|required|exists:newborn_screening_types,id',
            'performed_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:pending,scheduled,in_progress,completed,not_applicable,requires_followup',
            'result' => 'nullable|in:passed,failed,inconclusive,pending',
            'remarks' => 'nullable|string',
        ]);

        $screening->update($validated);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($screening)
            ->withProperties([
                'newborn_id' => $screening->newborn->newborn_id,
                'screening_type' => $screening->screeningType->name,
            ])
            ->log('Updated newborn screening');

        return response()->json([
            'message' => 'Screening updated successfully',
            'screening' => $screening->load(['newborn', 'screeningType', 'assignedPersonnel']),
        ]);
    }

    /**
     * Delete a screening.
     */
    public function destroy(Request $request, $id)
    {
        $screening = NewbornScreening::findOrFail($id);

        // Store info for logging
        $newbornId = $screening->newborn->newborn_id;
        $screeningTypeName = $screening->screeningType->name;

        $screening->delete();

        // Log activity
        activity()
            ->causedBy($request->user())
            ->withProperties([
                'newborn_id' => $newbornId,
                'screening_type' => $screeningTypeName,
            ])
            ->log('Deleted newborn screening');

        return response()->json([
            'message' => 'Screening deleted successfully',
        ]);
    }

    /**
     * Get screening statistics.
     */
    public function statistics()
    {
        $stats = [
            'total_screenings' => NewbornScreening::count(),
            'by_status' => [
                'pending' => NewbornScreening::where('status', 'pending')->count(),
                'scheduled' => NewbornScreening::where('status', 'scheduled')->count(),
                'in_progress' => NewbornScreening::where('status', 'in_progress')->count(),
                'completed' => NewbornScreening::where('status', 'completed')->count(),
                'not_applicable' => NewbornScreening::where('status', 'not_applicable')->count(),
                'requires_followup' => NewbornScreening::where('status', 'requires_followup')->count(),
            ],
            'by_result' => [
                'passed' => NewbornScreening::where('result', 'passed')->count(),
                'failed' => NewbornScreening::where('result', 'failed')->count(),
                'inconclusive' => NewbornScreening::where('result', 'inconclusive')->count(),
                'pending' => NewbornScreening::where('result', 'pending')->count(),
            ],
            'today' => NewbornScreening::whereDate('performed_date', today())->count(),
            'this_week' => NewbornScreening::whereBetween('performed_date', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => NewbornScreening::whereMonth('performed_date', now()->month)
                ->whereYear('performed_date', now()->year)
                ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get screening completion rate by newborn.
     */
    public function completionRate($newbornId)
    {
        $newborn = Newborn::findOrFail($newbornId);
        
        $mandatoryScreenings = NewbornScreeningType::where('is_mandatory', true)
            ->where('is_active', true)
            ->count();

        $completedScreenings = NewbornScreening::where('newborn_id', $newbornId)
            ->where('status', 'completed')
            ->whereHas('screeningType', function ($q) {
                $q->where('is_mandatory', true);
            })
            ->count();

        $completionRate = $mandatoryScreenings > 0
            ? round(($completedScreenings / $mandatoryScreenings) * 100, 2)
            : 0;

        return response()->json([
            'newborn' => $newborn->load('mother'),
            'mandatory_screenings' => $mandatoryScreenings,
            'completed_screenings' => $completedScreenings,
            'completion_rate' => $completionRate,
        ]);
    }
}
