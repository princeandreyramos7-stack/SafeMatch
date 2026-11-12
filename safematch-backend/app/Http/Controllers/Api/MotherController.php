<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mother;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MotherController extends Controller
{
    /**
     * Display a listing of mothers.
     */
    public function index(Request $request)
    {
        $query = Mother::with(['attendingPersonnel', 'newborns', 'qrCode']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('mother_id', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by admission date range
        if ($request->has('from_date')) {
            $query->whereDate('admission_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('admission_date', '<=', $request->to_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $mothers = $query->paginate($request->get('per_page', 15));

        return response()->json($mothers);
    }

    /**
     * Store a newly created mother.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'admission_info' => 'nullable|string',
            'admission_date' => 'nullable|date',
            'attending_personnel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:active,discharged,archived',
        ]);

        // Generate unique mother ID
        $validated['mother_id'] = $this->generateMotherId();

        // Set attending personnel to current user if not specified
        if (!isset($validated['attending_personnel_id'])) {
            $validated['attending_personnel_id'] = $request->user()->id;
        }

        $mother = Mother::create($validated);

        // Load relationships
        $mother->load(['attendingPersonnel', 'qrCode']);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($mother)
            ->log('Registered new mother');

        return response()->json([
            'message' => 'Mother registered successfully',
            'mother' => $mother,
        ], 201);
    }

    /**
     * Display the specified mother.
     */
    public function show(Mother $mother)
    {
        $mother->load([
            'attendingPersonnel',
            'newborns.qrCode',
            'qrCode',
            'maternalAssessments.assessmentType',
            'maternalAssessments.assessedBy',
            'qrVerifications.newborn',
            'dischargeRecords.newborn'
        ]);

        return response()->json($mother);
    }

    /**
     * Update the specified mother.
     */
    public function update(Request $request, Mother $mother)
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'date_of_birth' => 'sometimes|required|date|before:today',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'admission_info' => 'nullable|string',
            'admission_date' => 'nullable|date',
            'attending_personnel_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:active,discharged,archived',
        ]);

        $mother->update($validated);

        // Load relationships
        $mother->load(['attendingPersonnel', 'newborns', 'qrCode']);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($mother)
            ->log('Updated mother record');

        return response()->json([
            'message' => 'Mother updated successfully',
            'mother' => $mother,
        ]);
    }

    /**
     * Remove the specified mother.
     */
    public function destroy(Request $request, Mother $mother)
    {
        // Check if mother has active newborns
        if ($mother->newborns()->where('status', 'active')->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete mother with active newborn records. Please archive or discharge first.',
            ], 422);
        }

        // Log activity before deletion
        activity()
            ->causedBy($request->user())
            ->performedOn($mother)
            ->log('Deleted mother record');

        $mother->delete();

        return response()->json([
            'message' => 'Mother deleted successfully',
        ]);
    }

    /**
     * Generate a unique mother ID.
     */
    private function generateMotherId(): string
    {
        do {
            // Format: M-YYYYMMDD-XXXX (M for Mother, date, 4-digit random)
            $motherId = 'M-' . date('Ymd') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Mother::where('mother_id', $motherId)->exists());

        return $motherId;
    }

    /**
     * Get statistics for mothers.
     */
    public function statistics()
    {
        $stats = [
            'total' => Mother::count(),
            'active' => Mother::where('status', 'active')->count(),
            'discharged' => Mother::where('status', 'discharged')->count(),
            'archived' => Mother::where('status', 'archived')->count(),
            'this_month' => Mother::whereMonth('created_at', date('m'))
                ->whereYear('created_at', date('Y'))
                ->count(),
            'with_qr' => Mother::has('qrCode')->count(),
            'without_qr' => Mother::doesntHave('qrCode')->count(),
        ];

        return response()->json($stats);
    }
}
