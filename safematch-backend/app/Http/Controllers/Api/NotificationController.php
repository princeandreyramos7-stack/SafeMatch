<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $query = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc');

        // Filter by read/unread
        if ($request->has('unread_only') && $request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->paginate($request->input('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification
     */
    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Create a notification (for system use)
     */
    public static function createNotification(array $data)
    {
        return Notification::create([
            'user_id' => $data['user_id'],
            'type' => $data['type'],
            'title' => $data['title'],
            'message' => $data['message'],
            'data' => $data['data'] ?? null,
            'action_url' => $data['action_url'] ?? null,
        ]);
    }

    /**
     * Create notifications for critical events
     */
    public static function notifyCriticalAssessment($motherId, $assessmentId)
    {
        $users = \App\Models\User::where('role', 'healthcare_personnel')
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            self::createNotification([
                'user_id' => $user->id,
                'type' => 'critical_assessment',
                'title' => 'Critical Assessment Alert',
                'message' => 'A critical maternal assessment has been recorded',
                'data' => json_encode([
                    'mother_id' => $motherId,
                    'assessment_id' => $assessmentId
                ]),
                'action_url' => "/maternal-assessments?mother_id={$motherId}",
            ]);
        }
    }

    /**
     * Notify about screening requiring followup
     */
    public static function notifyScreeningFollowup($newbornId, $screeningId)
    {
        $users = \App\Models\User::where('role', 'healthcare_personnel')
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            self::createNotification([
                'user_id' => $user->id,
                'type' => 'screening_followup',
                'title' => 'Screening Followup Required',
                'message' => 'A newborn screening requires followup action',
                'data' => json_encode([
                    'newborn_id' => $newbornId,
                    'screening_id' => $screeningId
                ]),
                'action_url' => "/screenings?newborn_id={$newbornId}",
            ]);
        }
    }

    /**
     * Notify about discharge approval
     */
    public static function notifyDischargeApproval($motherId, $newbornId)
    {
        $users = \App\Models\User::where('role', 'healthcare_personnel')
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            self::createNotification([
                'user_id' => $user->id,
                'type' => 'discharge_approved',
                'title' => 'Discharge Approved',
                'message' => 'A mother-newborn pair has been approved for discharge',
                'data' => json_encode([
                    'mother_id' => $motherId,
                    'newborn_id' => $newbornId
                ]),
                'action_url' => "/discharge",
            ]);
        }
    }
}
