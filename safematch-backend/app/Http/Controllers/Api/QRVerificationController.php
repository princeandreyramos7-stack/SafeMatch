<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QRCode;
use App\Models\QRVerification;
use App\Models\Mother;
use App\Models\Newborn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class QRVerificationController extends Controller
{
    /**
     * Verify a single QR code (decode and validate).
     */
    public function verifySingle(Request $request)
    {
        $validated = $request->validate([
            'qr_data' => 'required|string',
        ]);

        try {
            // Parse QR data (should be JSON)
            $qrData = json_decode($validated['qr_data'], true);

            if (!$qrData || !isset($qrData['code']) || !isset($qrData['token'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format',
                ], 400);
            }

            // Find QR code
            $qrCode = QRCode::where('code', $qrData['code'])->first();

            if (!$qrCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code not found in system',
                ], 404);
            }

            // Check if revoked
            if ($qrCode->status === 'revoked') {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has been revoked',
                    'qr_code' => $qrCode,
                ], 403);
            }

            // Verify token hash
            $tokenHash = hash('sha256', $qrData['token']);
            if ($tokenHash !== $qrCode->token_hash) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code token',
                ], 401);
            }

            // Load the associated record
            $record = $qrCode->qrcodeable;

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Associated record not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'QR code verified successfully',
                'qr_code' => $qrCode,
                'type' => $qrCode->qr_type,
                'record' => $record,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse QR code data',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify mother-newborn pairing (scan both QR codes).
     */
    public function verifyPairing(Request $request)
    {
        $validated = $request->validate([
            'mother_qr_data' => 'required|string',
            'newborn_qr_data' => 'required|string',
        ]);

        try {
            // Parse both QR codes
            $motherQrData = json_decode($validated['mother_qr_data'], true);
            $newbornQrData = json_decode($validated['newborn_qr_data'], true);

            if (!$motherQrData || !$newbornQrData) {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Invalid QR code format',
                ], 400);
            }

            // Verify mother QR
            $motherQR = QRCode::where('code', $motherQrData['code'])->first();
            if (!$motherQR || $motherQR->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Invalid or revoked mother QR code',
                ], 404);
            }

            // Verify token
            $motherTokenHash = hash('sha256', $motherQrData['token']);
            if ($motherTokenHash !== $motherQR->token_hash) {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Invalid mother QR code token',
                ], 401);
            }

            // Verify newborn QR
            $newbornQR = QRCode::where('code', $newbornQrData['code'])->first();
            if (!$newbornQR || $newbornQR->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Invalid or revoked newborn QR code',
                ], 404);
            }

            // Verify token
            $newbornTokenHash = hash('sha256', $newbornQrData['token']);
            if ($newbornTokenHash !== $newbornQR->token_hash) {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Invalid newborn QR code token',
                ], 401);
            }

            // Load records
            $mother = $motherQR->qrcodeable;
            $newborn = $newbornQR->qrcodeable;

            if (!$mother || !$newborn) {
                return response()->json([
                    'success' => false,
                    'match' => false,
                    'message' => 'Associated records not found',
                ], 404);
            }

            // Check if they're related
            $isMatch = $newborn->mother_id === $mother->id;

            // Create verification record
            $verification = QRVerification::create([
                'mother_qr_code_id' => $motherQR->id,
                'newborn_qr_code_id' => $newbornQR->id,
                'verified_by' => $request->user()->id,
                'verification_result' => $isMatch ? 'match' : 'no_match',
                'verification_notes' => $isMatch 
                    ? 'Mother-newborn pairing verified successfully'
                    : 'WARNING: Mother-newborn pairing does not match',
            ]);

            // Log activity
            activity()
                ->causedBy($request->user())
                ->performedOn($verification)
                ->withProperties([
                    'mother' => $mother->mother_id,
                    'newborn' => $newborn->newborn_id,
                    'result' => $isMatch ? 'match' : 'no_match',
                ])
                ->log($isMatch ? 'Verified mother-newborn match' : 'Detected mother-newborn mismatch');

            return response()->json([
                'success' => true,
                'match' => $isMatch,
                'message' => $isMatch 
                    ? '✓ MATCH: Mother and newborn pairing verified'
                    : '✗ NO MATCH: This newborn does not belong to this mother',
                'verification' => $verification,
                'mother' => [
                    'id' => $mother->id,
                    'mother_id' => $mother->mother_id,
                    'full_name' => $mother->full_name,
                    'date_of_birth' => $mother->date_of_birth,
                ],
                'newborn' => [
                    'id' => $newborn->id,
                    'newborn_id' => $newborn->newborn_id,
                    'full_name' => $newborn->full_name,
                    'sex' => $newborn->sex,
                    'date_time_of_birth' => $newborn->date_time_of_birth,
                    'mother_id' => $newborn->mother_id,
                    'expected_mother_name' => $newborn->mother->full_name ?? null,
                ],
            ], $isMatch ? 200 : 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'match' => false,
                'message' => 'Verification failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get verification history.
     */
    public function history(Request $request)
    {
        $query = QRVerification::with([
            'motherQRCode.qrcodeable',
            'newbornQRCode.qrcodeable',
            'verifiedBy'
        ])->latest();

        // Filter by result
        if ($request->has('result') && $request->result !== 'all') {
            $query->where('verification_result', $request->result);
        }

        // Filter by date
        if ($request->has('date_from')) {
            $query->whereDate('verified_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('verified_at', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('motherQRCode.qrcodeable', function ($q) use ($search) {
                $q->where('mother_id', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            })->orWhereHas('newbornQRCode.qrcodeable', function ($q) use ($search) {
                $q->where('newborn_id', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        $verifications = $query->paginate(20);

        return response()->json($verifications);
    }

    /**
     * Get verification statistics.
     */
    public function statistics()
    {
        $stats = [
            'total_verifications' => QRVerification::count(),
            'matches' => QRVerification::where('verification_result', 'match')->count(),
            'no_matches' => QRVerification::where('verification_result', 'no_match')->count(),
            'today' => QRVerification::whereDate('verified_at', today())->count(),
            'this_week' => QRVerification::whereBetween('verified_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month' => QRVerification::whereMonth('verified_at', now()->month)
                ->whereYear('verified_at', now()->year)
                ->count(),
        ];

        $stats['match_rate'] = $stats['total_verifications'] > 0
            ? round(($stats['matches'] / $stats['total_verifications']) * 100, 2)
            : 0;

        return response()->json($stats);
    }
}
