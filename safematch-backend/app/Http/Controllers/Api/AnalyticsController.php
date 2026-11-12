<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mother;
use App\Models\Newborn;
use App\Models\NewbornScreening;
use App\Models\MaternalAssessment;
use App\Models\QRVerification;
use App\Models\DischargeDecision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get overall statistics with date range filtering
     */
    public function overview(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        $stats = [
            'registrations' => [
                'mothers' => Mother::whereBetween('admission_date', [$startDate, $endDate])->count(),
                'newborns' => Newborn::whereBetween('created_at', [$startDate, $endDate])->count(),
            ],
            'screenings' => [
                'total' => NewbornScreening::whereBetween('created_at', [$startDate, $endDate])->count(),
                'completed' => NewbornScreening::where('status', 'completed')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
                'pending' => NewbornScreening::where('status', 'pending')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
                'requires_followup' => NewbornScreening::where('status', 'requires_followup')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
            ],
            'assessments' => [
                'total' => MaternalAssessment::whereBetween('assessment_date', [$startDate, $endDate])->count(),
                'completed' => MaternalAssessment::where('status', 'completed')
                    ->whereBetween('assessment_date', [$startDate, $endDate])->count(),
                'pending' => MaternalAssessment::where('status', 'pending')
                    ->whereBetween('assessment_date', [$startDate, $endDate])->count(),
            ],
            'qr_verifications' => [
                'total' => QRVerification::whereBetween('verified_at', [$startDate, $endDate])->count(),
                'matches' => QRVerification::where('verification_result', 'match')
                    ->whereBetween('verified_at', [$startDate, $endDate])->count(),
                'no_matches' => QRVerification::where('verification_result', 'no_match')
                    ->whereBetween('verified_at', [$startDate, $endDate])->count(),
            ],
            'discharges' => [
                'total' => DischargeDecision::whereBetween('created_at', [$startDate, $endDate])->count(),
                'approved' => DischargeDecision::where('decision', 'approved')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
                'pending' => DischargeDecision::where('decision', 'pending')
                    ->whereBetween('created_at', [$startDate, $endDate])->count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Get registration trends over time
     */
    public function registrationTrends(Request $request)
    {
        $days = $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days);

        $motherTrends = Mother::select(
            DB::raw('DATE(admission_date) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('admission_date', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $newbornTrends = Newborn::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'mothers' => $motherTrends,
            'newborns' => $newbornTrends,
        ]);
    }

    /**
     * Get screening performance analytics
     */
    public function screeningAnalytics(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        // Screening completion rate by type
        $screeningsByType = DB::table('newborn_screenings')
            ->join('newborn_screening_types', 'newborn_screenings.screening_type_id', '=', 'newborn_screening_types.id')
            ->select(
                'newborn_screening_types.name',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN newborn_screenings.status = "completed" THEN 1 ELSE 0 END) as completed')
            )
            ->whereBetween('newborn_screenings.created_at', [$startDate, $endDate])
            ->groupBy('newborn_screening_types.id', 'newborn_screening_types.name')
            ->get();

        // Average time to complete screenings
        $avgCompletionTime = NewbornScreening::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('completed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as avg_hours')
            ->first();

        return response()->json([
            'by_type' => $screeningsByType,
            'avg_completion_hours' => round($avgCompletionTime->avg_hours ?? 0, 2),
        ]);
    }

    /**
     * Get assessment analytics
     */
    public function assessmentAnalytics(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        // Assessment status distribution
        $statusDistribution = MaternalAssessment::select(
            'status',
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('assessment_date', [$startDate, $endDate])
            ->groupBy('status')
            ->get();

        // Assessments by type
        $assessmentsByType = DB::table('maternal_assessments')
            ->join('maternal_assessment_types', 'maternal_assessments.assessment_type_id', '=', 'maternal_assessment_types.id')
            ->select(
                'maternal_assessment_types.name',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN maternal_assessments.status = "completed" THEN 1 ELSE 0 END) as completed')
            )
            ->whereBetween('maternal_assessments.assessment_date', [$startDate, $endDate])
            ->groupBy('maternal_assessment_types.id', 'maternal_assessment_types.name')
            ->get();

        return response()->json([
            'status_distribution' => $statusDistribution,
            'by_type' => $assessmentsByType,
        ]);
    }

    /**
     * Export data to CSV
     */
    public function exportCSV(Request $request)
    {
        $type = $request->input('type', 'overview');
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        $filename = "safematch_{$type}_" . Carbon::now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');
            
            switch ($type) {
                case 'mothers':
                    $this->exportMothersCSV($file, $startDate, $endDate);
                    break;
                case 'newborns':
                    $this->exportNewbornsCSV($file, $startDate, $endDate);
                    break;
                case 'screenings':
                    $this->exportScreeningsCSV($file, $startDate, $endDate);
                    break;
                case 'assessments':
                    $this->exportAssessmentsCSV($file, $startDate, $endDate);
                    break;
                case 'discharges':
                    $this->exportDischargesCSV($file, $startDate, $endDate);
                    break;
                default:
                    $this->exportOverviewCSV($file, $startDate, $endDate);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportMothersCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['Mother ID', 'Full Name', 'Date of Birth', 'Contact Number', 'Admission Date', 'Status']);
        
        Mother::whereBetween('admission_date', [$startDate, $endDate])
            ->chunk(100, function($mothers) use ($file) {
                foreach ($mothers as $mother) {
                    fputcsv($file, [
                        $mother->mother_id,
                        $mother->full_name,
                        $mother->date_of_birth,
                        $mother->contact_number,
                        $mother->admission_date,
                        $mother->status,
                    ]);
                }
            });
    }

    private function exportNewbornsCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['Newborn ID', 'Full Name', 'Mother', 'Birth Date', 'Sex', 'Birth Weight', 'Status']);
        
        Newborn::with('mother')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->chunk(100, function($newborns) use ($file) {
                foreach ($newborns as $newborn) {
                    fputcsv($file, [
                        $newborn->newborn_id,
                        $newborn->full_name,
                        $newborn->mother->full_name ?? 'N/A',
                        $newborn->date_time_of_birth,
                        $newborn->sex,
                        $newborn->birth_weight,
                        $newborn->status,
                    ]);
                }
            });
    }

    private function exportScreeningsCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['Newborn ID', 'Screening Type', 'Performed Date', 'Status', 'Result']);
        
        NewbornScreening::with(['newborn', 'screeningType'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->chunk(100, function($screenings) use ($file) {
                foreach ($screenings as $screening) {
                    fputcsv($file, [
                        $screening->newborn->newborn_id ?? 'N/A',
                        $screening->screeningType->name ?? 'N/A',
                        $screening->performed_date,
                        $screening->status,
                        $screening->result ?? 'N/A',
                    ]);
                }
            });
    }

    private function exportAssessmentsCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['Mother ID', 'Assessment Type', 'Assessment Date', 'Status', 'Assessed By']);
        
        MaternalAssessment::with(['mother', 'assessmentType', 'assessedBy'])
            ->whereBetween('assessment_date', [$startDate, $endDate])
            ->chunk(100, function($assessments) use ($file) {
                foreach ($assessments as $assessment) {
                    fputcsv($file, [
                        $assessment->mother->mother_id ?? 'N/A',
                        $assessment->assessmentType->name ?? 'N/A',
                        $assessment->assessment_date,
                        $assessment->status,
                        $assessment->assessedBy->name ?? 'N/A',
                    ]);
                }
            });
    }

    private function exportDischargesCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['Mother ID', 'Newborn ID', 'Decision', 'Decision Date', 'Decided By']);
        
        DischargeDecision::with(['mother', 'newborn', 'decidedBy'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->chunk(100, function($discharges) use ($file) {
                foreach ($discharges as $discharge) {
                    fputcsv($file, [
                        $discharge->mother->mother_id ?? 'N/A',
                        $discharge->newborn->newborn_id ?? 'N/A',
                        $discharge->decision,
                        $discharge->decision_date,
                        $discharge->decidedBy->name ?? 'N/A',
                    ]);
                }
            });
    }

    private function exportOverviewCSV($file, $startDate, $endDate)
    {
        fputcsv($file, ['SafeMatch Analytics Report']);
        fputcsv($file, ['Date Range', Carbon::parse($startDate)->format('Y-m-d') . ' to ' . Carbon::parse($endDate)->format('Y-m-d')]);
        fputcsv($file, []);
        
        fputcsv($file, ['Metric', 'Count']);
        fputcsv($file, ['Total Mothers', Mother::whereBetween('admission_date', [$startDate, $endDate])->count()]);
        fputcsv($file, ['Total Newborns', Newborn::whereBetween('created_at', [$startDate, $endDate])->count()]);
        fputcsv($file, ['Total Screenings', NewbornScreening::whereBetween('created_at', [$startDate, $endDate])->count()]);
        fputcsv($file, ['Total Assessments', MaternalAssessment::whereBetween('assessment_date', [$startDate, $endDate])->count()]);
        fputcsv($file, ['Total Discharges', DischargeDecision::whereBetween('created_at', [$startDate, $endDate])->count()]);
    }
}
