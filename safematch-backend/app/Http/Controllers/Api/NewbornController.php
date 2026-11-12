<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newborn;
use App\Models\Mother;
use Illuminate\Http\Request;

class NewbornController extends Controller
{
    /**
     * Display a listing of newborns.
     */
    public function index(Request $request)
    {
        $query = Newborn::with(['mother', 'attendingPersonnel', 'qrCode']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('newborn_id', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhereHas('mother', function ($mq) use ($search) {
                        $mq->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by mother
        if ($request->has('mother_id')) {
            $query->where('mother_id', $request->mother_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by sex
        if ($request->has('sex')) {
            $query->where('sex', $request->sex);
        }

        // Filter by birth date range
        if ($request->has('from_date')) {
            $query->whereDate('date_time_of_birth', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('date_time_of_birth', '<=', $request->to_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $newborns = $query->paginate($request->get('per_page', 15));

        return response()->json($newborns);
    }

    /**
     * Store a newly created newborn.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mother_id' => 'required|exists:mothers,id',
            'full_name' => 'nullable|string|max:255',
            'date_time_of_birth' => 'required|date|before_or_equal:now',
            'sex' => 'required|in:male,female,undetermined',
            'birth_weight' => 'nullable|numeric|min:0|max:10000',
            'birth_length' => 'nullable|numeric|min:0|max:100',
            'birth_head_circumference' => 'nullable|numeric|min:0|max:100',
            'delivery_info' => 'nullable|string',
            'attending_personnel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:active,discharged,archived',
        ]);

        // Verify mother exists and is active
        $mother = Mother::findOrFail($validated['mother_id']);
        if ($mother->status !== 'active') {
            return response()->json([
                'message' => 'Cannot register newborn. Mother record is not active.',
            ], 422);
        }

        // Generate unique newborn ID
        $validated['newborn_id'] = $this->generateNewbornId();

        // Set attending personnel to current user if not specified
        if (!isset($validated['attending_personnel_id'])) {
            $validated['attending_personnel_id'] = $request->user()->id;
        }

        $newborn = Newborn::create($validated);

        // Load relationships
        $newborn->load(['mother', 'attendingPersonnel', 'qrCode']);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($newborn)
            ->log('Registered new newborn');

        return response()->json([
            'message' => 'Newborn registered successfully',
            'newborn' => $newborn,
        ], 201);
    }

    /**
     * Display the specified newborn.
     */
    public function show(Newborn $newborn)
    {
        $newborn->load([
            'mother.qrCode',
            'attendingPersonnel',
            'qrCode',
            'screenings.screeningType',
            'screenings.assignedPersonnel',
            'qrVerifications.mother',
            'dischargeRecords'
        ]);

        return response()->json($newborn);
    }

    /**
     * Update the specified newborn.
     */
    public function update(Request $request, Newborn $newborn)
    {
        $validated = $request->validate([
            'mother_id' => 'sometimes|required|exists:mothers,id',
            'full_name' => 'nullable|string|max:255',
            'date_time_of_birth' => 'sometimes|required|date|before_or_equal:now',
            'sex' => 'sometimes|required|in:male,female,undetermined',
            'birth_weight' => 'nullable|numeric|min:0|max:10000',
            'birth_length' => 'nullable|numeric|min:0|max:100',
            'birth_head_circumference' => 'nullable|numeric|min:0|max:100',
            'delivery_info' => 'nullable|string',
            'attending_personnel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:active,discharged,archived',
        ]);

        // If changing mother, verify new mother exists and is active
        if (isset($validated['mother_id']) && $validated['mother_id'] != $newborn->mother_id) {
            $mother = Mother::findOrFail($validated['mother_id']);
            if ($mother->status !== 'active') {
                return response()->json([
                    'message' => 'Cannot change mother. New mother record is not active.',
                ], 422);
            }
        }

        $newborn->update($validated);

        // Load relationships
        $newborn->load(['mother', 'attendingPersonnel', 'qrCode']);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($newborn)
            ->log('Updated newborn record');

        return response()->json([
            'message' => 'Newborn updated successfully',
            'newborn' => $newborn,
        ]);
    }

    /**
     * Remove the specified newborn.
     */
    public function destroy(Request $request, Newborn $newborn)
    {
        // Check if newborn has active screenings
        if ($newborn->screenings()->whereIn('status', ['pending', 'in_progress'])->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete newborn with pending or in-progress screenings.',
            ], 422);
        }

        // Log activity before deletion
        activity()
            ->causedBy($request->user())
            ->performedOn($newborn)
            ->log('Deleted newborn record');

        $newborn->delete();

        return response()->json([
            'message' => 'Newborn deleted successfully',
        ]);
    }

    /**
     * Generate a unique newborn ID.
     */
    private function generateNewbornId(): string
    {
        do {
            // Format: NB-YYYYMMDD-XXXX (NB for Newborn, date, 4-digit random)
            $newbornId = 'NB-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Newborn::where('newborn_id', $newbornId)->exists());

        return $newbornId;
    }

    /**
     * Get statistics for newborns.
     */
    public function statistics()
    {
        $stats = [
            'total' => Newborn::count(),
            'active' => Newborn::where('status', 'active')->count(),
            'discharged' => Newborn::where('status', 'discharged')->count(),
            'archived' => Newborn::where('status', 'archived')->count(),
            'this_month' => Newborn::whereMonth('created_at', date('m'))
                ->whereYear('created_at', date('Y'))
                ->count(),
            'male' => Newborn::where('sex', 'male')->count(),
            'female' => Newborn::where('sex', 'female')->count(),
            'with_qr' => Newborn::has('qrCode')->count(),
            'without_qr' => Newborn::doesntHave('qrCode')->count(),
            'today' => Newborn::whereDate('date_time_of_birth', today())->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get available mothers for newborn registration.
     */
    public function availableMothers()
    {
        $mothers = Mother::where('status', 'active')
            ->select('id', 'mother_id', 'full_name', 'admission_date')
            ->orderBy('full_name')
            ->get();

        return response()->json($mothers);
    }
}
