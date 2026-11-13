<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QRCode;
use App\Models\Mother;
use App\Models\Newborn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode as QrCodeGenerator;

class QRCodeController extends Controller
{
    /**
     * Generate QR code for a mother or newborn.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:mother,newborn',
            'id' => 'required|integer',
        ]);

        // Find the model
        if ($validated['type'] === 'mother') {
            $model = Mother::findOrFail($validated['id']);
            $modelType = Mother::class;
            $prefix = 'M';
        } else {
            $model = Newborn::findOrFail($validated['id']);
            $modelType = Newborn::class;
            $prefix = 'NB';
        }

        // Check if QR already exists
        $existingQR = QRCode::where('qrcodeable_type', $modelType)
            ->where('qrcodeable_id', $validated['id'])
            ->where('status', 'active')
            ->first();

        if ($existingQR) {
            return response()->json([
                'message' => 'QR code already exists for this record',
                'qr_code' => $existingQR,
            ], 422);
        }

        // Generate unique code and secure token
        $code = $this->generateUniqueCode($prefix);
        $token = Str::random(64);
        $tokenHash = hash('sha256', $token);

        // Generate QR code data as URL (scannable by any QR app)
        // This creates a verification URL that can be opened in any browser
        $verificationUrl = config('app.frontend_url', 'http://localhost:5173') . 
                          '/verify?code=' . $code . 
                          '&token=' . $token . 
                          '&type=' . $validated['type'];

        // Also keep JSON data for backward compatibility
        $qrData = json_encode([
            'url' => $verificationUrl,
            'code' => $code,
            'token' => $token,
            'type' => $validated['type'],
            'id' => $model->{$validated['type'] === 'mother' ? 'mother_id' : 'newborn_id'},
        ]);

        // Generate QR image as PNG with the URL (universal support)
        $qrImage = QrCodeGenerator::format('png')
            ->size(300)
            ->margin(1)
            ->generate($verificationUrl); // Use URL instead of JSON

        // Save to storage
        $filename = $code . '_' . time() . '.png';
        $path = 'qr-codes/' . $validated['type'] . 's/' . $filename;
        Storage::disk('public')->put($path, $qrImage);

        // Create QR code record
        $qrCode = QRCode::create([
            'code' => $code,
            'qr_type' => $validated['type'],
            'qrcodeable_type' => $modelType,
            'qrcodeable_id' => $validated['id'],
            'token_hash' => $tokenHash,
            'image_path' => $path,
            'status' => 'active',
            'generated_by' => $request->user()->id,
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($model)
            ->withProperties(['qr_code' => $code])
            ->log("Generated QR code for {$validated['type']}");

        return response()->json([
            'message' => 'QR code generated successfully',
            'qr_code' => $qrCode->load('generatedBy'),
            'download_url' => Storage::disk('public')->url($path),
        ], 201);
    }

    /**
     * Revoke a QR code.
     */
    public function revoke(Request $request)
    {
        $validated = $request->validate([
            'qr_code_id' => 'required|exists:qr_codes,id',
            'reason' => 'nullable|string',
        ]);

        $qrCode = QRCode::findOrFail($validated['qr_code_id']);

        if ($qrCode->status === 'revoked') {
            return response()->json([
                'message' => 'QR code is already revoked',
            ], 422);
        }

        $qrCode->update([
            'status' => 'revoked',
            'revoked_at' => now(),
        ]);

        // Log activity
        activity()
            ->causedBy($request->user())
            ->performedOn($qrCode)
            ->withProperties(['reason' => $validated['reason'] ?? 'No reason provided'])
            ->log('Revoked QR code');

        return response()->json([
            'message' => 'QR code revoked successfully',
            'qr_code' => $qrCode,
        ]);
    }

    /**
     * Download QR code image.
     */
    public function download($id)
    {
        $qrCode = QRCode::findOrFail($id);

        if (!Storage::disk('public')->exists($qrCode->image_path)) {
            return response()->json([
                'message' => 'QR code image not found',
            ], 404);
        }

        return Storage::disk('public')->download($qrCode->image_path);
    }

    /**
     * Get QR code image (for preview).
     */
    public function image($id)
    {
        $qrCode = QRCode::findOrFail($id);

        if (!Storage::disk('public')->exists($qrCode->image_path)) {
            return response()->json([
                'message' => 'QR code image not found',
            ], 404);
        }

        $image = Storage::disk('public')->get($qrCode->image_path);
        
        // Determine content type based on file extension
        $extension = pathinfo($qrCode->image_path, PATHINFO_EXTENSION);
        $contentType = $extension === 'svg' ? 'image/svg+xml' : 'image/png';
        
        return response($image)
            ->header('Content-Type', $contentType)
            ->header('Cache-Control', 'public, max-age=3600')
            ->header('Access-Control-Allow-Origin', '*');
    }

    /**
     * Generate a unique QR code.
     */
    private function generateUniqueCode(string $prefix): string
    {
        do {
            // Format: PREFIX-YYYYMMDD-XXXXXX (6-digit random)
            $code = $prefix . '-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        } while (QRCode::where('code', $code)->exists());

        return $code;
    }

    /**
     * Get QR code statistics.
     */
    public function statistics()
    {
        $stats = [
            'total' => QRCode::count(),
            'active' => QRCode::where('status', 'active')->count(),
            'revoked' => QRCode::where('status', 'revoked')->count(),
            'mothers' => QRCode::where('qr_type', 'mother')->count(),
            'newborns' => QRCode::where('qr_type', 'newborn')->count(),
            'generated_today' => QRCode::whereDate('generated_at', today())->count(),
        ];

        return response()->json($stats);
    }
}
