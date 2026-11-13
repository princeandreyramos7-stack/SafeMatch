<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mother;
use App\Models\Newborn;
use App\Models\QRCode;
use App\Models\QRVerification;
use App\Models\NewbornScreening;
use App\Models\MaternalAssessment;
use App\Models\DischargeDecision;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get comprehensive dashboard statistics
     */
    public function statistics(Request $request)
    {
        // Overall statistics
        $totalMothers = Mother::count();
        $activeMothers = Mother::where('status', 'active')->count();
        $totalNewborns = Newborn::count();
        $activeNewborns = Newborn::where('status', 'active')->count();
        
        // QR Code statistics
        $totalQRCodes = QRCode::where('status', 'active')->count();
        $qrVerificationsToday = QRVerification::whereDate('created_at', today())->count();
        $qrMatchRate = $this->calculateMatchRate();
        
        // Screening statistics
        $pendingScreenings = NewbornScreening::where('status', 'pending')->count();
        $completedScreenings = NewbornScreening::where('status', 'completed')->count();
        $requireFollowup = NewbornScreening::where('status', 'requires_followup')->count();
        
        // Maternal assessment statistics
        $criticalAssessments = MaternalAssessment::where('status', 'critical')
            ->whereDate('created_at', '>=', now()->subHours(24))
            ->count();
        $assessmentsToday = MaternalAssessment::whereDate('created_at', today())->count();
        
        // Discharge statistics
        $readyForDischarge = $this->calculateReadyForDischarge();
        $pendingApproval = DischargeDecision::where('decision', 'pending')->count();
        $dischargedToday = DischargeDecision::where('decision', 'approved')
            ->whereDate('actual_discharge_date', today())
            ->count();
        
        // System statistics
        $totalUsers = User::where('is_active', true)->count();
        $activePersonnel = User::where('is_active', true)
            ->where('role', 'healthcare_personnel')
            ->count();
        
        return response()->json([
            'overall' => [
                'total_mothers' => $totalMothers,
                'active_mothers' => $activeMothers,
                'total_newborns' => $totalNewborns,
                'active_newborns' => $activeNewborns,
            ],
            'qr_codes' => [
                'total_active' => $totalQRCodes,
                'verifications_today' => $qrVerificationsToday,
                'match_rate' => $qrMatchRate,
            ],
            'screenings' => [
                'pending' => $pendingScreenings,
                'completed' => $completedScreenings,
                'require_followup' => $requireFollowup,
            ],
            'assessments' => [
                'critical_24h' => $criticalAssessments,
                'today' => $assessmentsToday,
            ],
            'discharge' => [
                'ready' => $readyForDischarge,
                'pending_approval' => $pendingApproval,
                'discharged_today' => $dischargedToday,
            ],
            'system' => [
                'total_users' => $totalUsers,
                'active_personnel' => $activePersonnel,
            ],
        ]);
    }

    /**
     * Get registration trends (last 7 days)
     */
    public function registrationTrends(Request $request)
    {
        $days = $request->input('days', 7);
        $startDate = now()->subDays($days - 1)->startOfDay();
        
        $motherTrends = Mother::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
        
        $newbornTrends = Newborn::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
        
        // Fill in missing dates with zero counts
        $trends = [];
        for ($i = 0; $i < $days; $i++) {
            $date = now()->subDays($days - 1 - $i)->format('Y-m-d');
            $trends[] = [
                'date' => $date,
                'mothers' => $motherTrends->get($date)->count ?? 0,
                'newborns' => $newbornTrends->get($date)->count ?? 0,
            ];
        }
        
        return response()->json($trends);
    }

    /**
     * Get verification statistics (last 7 days)
     */
    public function verificationTrends(Request $request)
    {
        $days = $request->input('days', 7);
        $startDate = now()->subDays($days - 1)->startOfDay();
        
        $verifications = QRVerification::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(CASE WHEN verification_result = "match" THEN 1 ELSE 0 END) as matches'),
            DB::raw('SUM(CASE WHEN verification_result = "no_match" THEN 1 ELSE 0 END) as no_matches'),
            DB::raw('COUNT(*) as total')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
        
        // Fill in missing dates
        $trends = [];
        for ($i = 0; $i < $days; $i++) {
            $date = now()->subDays($days - 1 - $i)->format('Y-m-d');
            $data = $verifications->get($date);
            
            $trends[] = [
                'date' => $date,
                'matches' => $data->matches ?? 0,
                'no_matches' => $data->no_matches ?? 0,
                'total' => $data->total ?? 0,
            ];
        }
        
        return response()->json($trends);
    }

    /**
     * Get screening status distribution
     */
    public function screeningDistribution()
    {
        $distribution = NewbornScreening::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst(str_replace('_', ' ', $item->status)),
                    'value' => $item->count,
                ];
            });
        
        return response()->json($distribution);
    }

    /**
     * Get maternal assessment status distribution
     */
    public function assessmentDistribution()
    {
        $distribution = MaternalAssessment::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst(str_replace('_', ' ', $item->status)),
                    'value' => $item->count,
                ];
            });
        
        return response()->json($distribution);
    }

    /**
     * Get recent activities
     */
    public function recentActivities(Request $request)
    {
        $limit = $request->input('limit', 10);
        
        // Get recent registrations
        $recentMothers = Mother::with('attendingPersonnel')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($mother) {
                return [
                    'type' => 'mother_registered',
                    'title' => 'Mother Registered',
                    'description' => "Mother {$mother->full_name} ({$mother->mother_id}) was registered",
                    'user' => $mother->attendingPersonnel->name ?? 'System',
                    'time' => $mother->created_at,
                ];
            });
        
        $recentNewborns = Newborn::with('attendingPersonnel')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($newborn) {
                return [
                    'type' => 'newborn_registered',
                    'title' => 'Newborn Registered',
                    'description' => "Newborn {$newborn->full_name} ({$newborn->newborn_id}) was registered",
                    'user' => $newborn->attendingPersonnel->name ?? 'System',
                    'time' => $newborn->created_at,
                ];
            });
        
        // Get recent verifications
        $recentVerifications = QRVerification::with('verifiedBy')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($verification) {
                return [
                    'type' => 'qr_verification',
                    'title' => 'QR Verification',
                    'description' => "QR verification resulted in {$verification->verification_result}",
                    'user' => $verification->verifiedBy->name ?? 'System',
                    'time' => $verification->created_at,
                ];
            });
        
        // Get recent critical assessments
        $criticalAssessments = MaternalAssessment::with(['mother', 'assessedBy'])
            ->where('status', 'critical')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($assessment) {
                return [
                    'type' => 'critical_assessment',
                    'title' => 'Critical Assessment',
                    'description' => "Critical assessment for {$assessment->mother->full_name}",
                    'user' => $assessment->assessedBy->name ?? 'System',
                    'time' => $assessment->created_at,
                ];
            });
        
        // Combine and sort by time
        $activities = collect()
            ->concat($recentMothers)
            ->concat($recentNewborns)
            ->concat($recentVerifications)
            ->concat($criticalAssessments)
            ->sortByDesc('time')
            ->take($limit)
            ->values();
        
        return response()->json($activities);
    }

    /**
     * Get alerts and notifications
     */
    public function alerts()
    {
        $alerts = [];
        
        // Critical assessments in last 24 hours
        $criticalCount = MaternalAssessment::where('status', 'critical')
            ->whereDate('created_at', '>=', now()->subHours(24))
            ->count();
        
        if ($criticalCount > 0) {
            $alerts[] = [
                'type' => 'critical',
                'title' => 'Critical Assessments',
                'message' => "{$criticalCount} critical maternal assessment(s) in the last 24 hours",
                'count' => $criticalCount,
                'link' => '/maternal-assessments',
            ];
        }
        
        // Screenings requiring followup
        $followupCount = NewbornScreening::where('status', 'requires_followup')->count();
        if ($followupCount > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Followup Required',
                'message' => "{$followupCount} screening(s) require followup",
                'count' => $followupCount,
                'link' => '/screenings',
            ];
        }
        
        // Ready for discharge
        $readyCount = $this->calculateReadyForDischarge();
        if ($readyCount > 0) {
            $alerts[] = [
                'type' => 'success',
                'title' => 'Ready for Discharge',
                'message' => "{$readyCount} mother-newborn pair(s) ready for discharge",
                'count' => $readyCount,
                'link' => '/discharge',
            ];
        }
        
        return response()->json($alerts);
    }

    /**
     * Calculate QR verification match rate
     */
    private function calculateMatchRate()
    {
        $total = QRVerification::count();
        
        if ($total === 0) {
            return 0;
        }
        
        $matches = QRVerification::where('verification_result', 'match')->count();
        
        return round(($matches / $total) * 100, 1);
    }

    /**
     * Calculate ready for discharge count
     */
    private function calculateReadyForDischarge()
    {
        // This is a simplified calculation
        // In a real scenario, you would check discharge requirements
        return DischargeDecision::where('decision', 'approved')->count();
    }
}
