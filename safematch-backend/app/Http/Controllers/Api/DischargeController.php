<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DischargeRecord;
use App\Models\DischargeDecision;
use App\Models\DischargeRequirement;
use App\Models\Mother;
use App\Models\Newborn;
use Illuminate\Http\Request;

class DischargeController extends Controller
{
    /**
     * Get all discharge records.
     */
    public function index(Request $request)
    {
        $query = DischargeRecord::with([
            'mother',
            'newborn',
            'dischargeRequirement'
        ])->latest('created_at');

        // Filter by mother
        if ($request->has('mother_id')) {
            $query->where('mother_id', $request->mother_id);
        }

        // Filter by newborn
        if ($request->has('newborn_id')) {
            $query->where('newborn_id', $request->newborn_id);
        }

        // Filter by completion status
        if ($request->has('is_completed')) {
            $query->where('is_completed', $request->is_completed);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('mother', function ($mq) use ($search) {
                    $mq->where('mother_id', 'like', "%{$search}%")
                       ->orWhere('full_name', 'like', "%{$search}%");
                })->orWhereHas('newborn', function ($nq) use ($search) {
                    $nq->where('newborn_id', 'like', "%{$search}%")
                       ->orWhere('full_name', 'like', "%{$search}%");
                });
            });
        }

        $records = $query->paginate(50);

        return response()->json($records);
    }

    /**
     * Get discharge readiness for a mother-newborn pair.
     */
    public function getReadiness($motherId, $newbornId = null)
    {
        $mother = Mother::findOrFail($motherId);
        $newborn = $newbornId ? Newborn::findOrFail($newbornId) : null;

        // Get all active requirements
        $requirements = DischargeRequirement::where('is_active', true)->get();

        $motherRequirements = $requirements->whereIn('applies_to', ['mother', 'both']);
        $newbornRequirements = $newborn ? $requirements->whereIn('applies_to', ['newborn', 'both']) : collect();

        // Get completion records
        $motherRecords = DischargeRecord::where('mother_id', $motherId)
            ->whereNull('newborn_id')
            ->get()
            ->keyBy('discharge_requirement_id');

        $newbornRecords = $newborn ? DischargeRecord::where('newborn_id', $newbornId)
            ->get()
            ->keyBy('discharge_requirement_id') : collect();

        // Calculate readiness
        $motherReady = $motherRequirements->filter(function ($req) {
            return $req->is_mandatory;
        })->every(function ($req) use ($motherRecords) {
            return isset($motherRecords[$req->id]) && $motherRecords[$req->id]->is_completed;
        });

        $newbornReady = $newborn ? $newbornRequirements->filter(function ($req) {
            return $req->is_mandatory;
        })->every(function ($req) use ($newbornRecords) {
            return isset($newbornRecords[$req->id]) && $newbornRecords[$req->id]->is_completed;
        }) : true;

        $overallReady = $motherReady && $newbornReady;

        // Get discharge decision
        $dischargeDecision = null;
        if ($newborn) {
            $dischargeDecision = DischargeDecision::where('mother_id', $motherId)
                ->where('newborn_id', $newbornId)
                ->latest()
                ->first();
        }

        return response()->json([
            'mother' => $mother,
            'newborn' => $newborn,
            'mother_requirements' => $motherRequirements->map(function ($req) use ($motherRecords) {
                $record = $motherRecords[$req->id] ?? null;
                return [
                    'requirement' => $req,
                    'is_completed' => $record ? $record->is_completed : false,
                    'completed_at' => $record ? $record->completed_at : null,
                    'completed_by' => $record ? $record->completedBy : null,
                    'notes' => $record ? $record->notes : null,
                ];
            }),
            'newborn_requirements' => $newbornRequirements->map(function ($req) use ($newbornRecords) {
                $record = $newbornRecords[$req->id] ?? null;
                return [
                    'requirement' => $req,
                    'is_completed' => $record ? $record->is_completed : false,
                    'completed_at' => $record ? $record->completed_at : null,
                    'completed_by' => $record ? $record->completedBy : null,
                    'notes' => $record ? $record->notes : null,
                ];
            }),
            'readiness' => [
                'mother_ready' => $motherReady,
                'newborn_ready' => $newbornReady,
                'overall_ready' => $overallReady,
            ],
            'discharge_decision' => $dischargeDecision,
        ]);
    }

    /**
     * Update requirement completion.
     */
    public function updateRequirement(Request $request)
    {
        $validated = $request->validate([
            'mother_id' => 'required|exists:mothers,id',
            'newborn_id' => 'nullable|exists:newborns,id',
            'discharge_requirement_id' => 'required|exists:discharge_requirements,id',
            'is_completed' => 'required|boolean',
            'notes' => 'nullable|string',
        ]);

        $record = DischargeRecord::firstOrCreate([
            'mother_id' => $validated['mother_id'],
            'newborn_id' => $validated['newborn_id'],
            'discharge_requirement_id' => $validated['discharge_requirement_id'],
        ]);

        $record->update([
            'is_completed' => $validated['is_completed'],
            'completed_at' => $validated['is_completed'] ? now() : null,
            'completed_by' => $validated['is_completed'] ? $request->user()->id : null,
            'notes' => $validated['notes'] ?? $record->notes,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($record)
            ->log($validated['is_completed'] ? 'Completed discharge requirement' : 'Uncompleted discharge requirement');

        return response()->json([
            'message' => 'Requirement status updated successfully',
            'record' => $record->load(['dischargeRequirement', 'completedBy']),
        ]);
    }

    /**
     * Create or update discharge decision.
     */
    public function createDecision(Request $request)
    {
        $validated = $request->validate([
            'mother_id' => 'required|exists:mothers,id',
            'newborn_id' => 'required|exists:newborns,id',
            'decision_status' => 'required|in:pending,approved,on_hold,discharged',
            'decision_notes' => 'nullable|string',
            'discharge_instructions' => 'nullable|string',
            'follow_up_required' => 'boolean',
            'follow_up_date' => 'nullable|date',
            'actual_discharge_date' => 'nullable|date',
        ]);

        $validated['decided_by'] = $request->user()->id;

        $decision = DischargeDecision::updateOrCreate(
            [
                'mother_id' => $validated['mother_id'],
                'newborn_id' => $validated['newborn_id'],
            ],
            $validated
        );

        // Update mother and newborn status if discharged
        if ($validated['decision_status'] === 'discharged') {
            Mother::where('id', $validated['mother_id'])->update(['status' => 'discharged']);
            Newborn::where('id', $validated['newborn_id'])->update(['status' => 'discharged']);
        }

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($decision)
            ->withProperties(['status' => $validated['decision_status']])
            ->log('Created/updated discharge decision');

        return response()->json([
            'message' => 'Discharge decision saved successfully',
            'decision' => $decision->load(['mother', 'newborn', 'decidedBy']),
        ], 201);
    }

    /**
     * Get discharge statistics.
     */
    public function statistics()
    {
        $stats = [
            'total_decisions' => DischargeDecision::count(),
            'by_status' => [
                'pending' => DischargeDecision::where('decision', 'pending')->count(),
                'approved' => DischargeDecision::where('decision', 'approved')->count(),
                'on_hold' => DischargeDecision::where('decision', 'on_hold')->count(),
                'discharged' => DischargeDecision::where('decision', 'discharged')->count(),
            ],
            'discharged_today' => DischargeDecision::whereDate('actual_discharge_date', today())->count(),
            'discharged_this_week' => DischargeDecision::whereBetween('actual_discharge_date', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'discharged_this_month' => DischargeDecision::whereMonth('actual_discharge_date', now()->month)
                ->whereYear('actual_discharge_date', now()->year)
                ->count(),
            'pending_discharge' => DischargeDecision::whereIn('decision', ['approved', 'pending'])->count(),
            'follow_up_required' => 0, // Placeholder - update if column exists
        ];

        return response()->json($stats);
    }

    /**
     * Get recent discharge decisions.
     */
    public function recentDecisions()
    {
        $decisions = DischargeDecision::with(['mother', 'newborn', 'decidedBy'])
            ->latest('updated_at')
            ->limit(20)
            ->get();

        return response()->json($decisions);
    }
}
