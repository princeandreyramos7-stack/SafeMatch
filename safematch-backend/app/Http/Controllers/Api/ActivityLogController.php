<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request)
    {
        $query = Activity::with(['causer', 'subject'])
            ->latest();

        // Filter by causer (user who performed the action)
        if ($request->has('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        // Filter by subject type
        if ($request->has('subject_type')) {
            $query->where('subject_type', $request->subject_type);
        }

        // Filter by log name
        if ($request->has('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by description (action)
        if ($request->has('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }

    /**
     * Display the specified activity log.
     */
    public function show(Activity $activity)
    {
        $activity->load(['causer', 'subject']);
        return response()->json($activity);
    }
}
