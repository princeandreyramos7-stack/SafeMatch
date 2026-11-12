<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\QRCode;
use App\Models\Mother;
use App\Models\Newborn;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode as QrCodeGenerator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QRCodeSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure qrcodes directory exists
        if (!Storage::disk('public')->exists('qrcodes')) {
            Storage::disk('public')->makeDirectory('qrcodes');
        }

        // Generate QR codes for all mothers
        $mothers = Mother::all();
        foreach ($mothers as $mother) {
            $this->generateQRCode($mother, 'M');
        }

        // Generate QR codes for all newborns
        $newborns = Newborn::all();
        foreach ($newborns as $newborn) {
            $this->generateQRCode($newborn, 'NB');
        }

        $this->command->info('✓ QR Codes generated for all mothers and newborns');
    }

    private function generateQRCode($model, $prefix): void
    {
        // Generate unique code
        $code = $prefix . '-' . Carbon::now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        
        // Generate secure token
        $token = Str::random(64);
        $hashedToken = hash('sha256', $token);

        // Generate QR data
        $qrData = json_encode([
            'code' => $code,
            'token' => $token,
            'type' => get_class($model),
            'id' => $model->id,
        ]);

        // Generate QR image as SVG (no imagick needed)
        $qrImage = QrCodeGenerator::format('svg')
            ->size(300)
            ->margin(1)
            ->generate($qrData);

        // Save image
        $filename = $code . '.svg';
        Storage::disk('public')->put('qrcodes/' . $filename, $qrImage);

        // Create database record
        QRCode::create([
            'qrcodeable_type' => get_class($model),
            'qrcodeable_id' => $model->id,
            'code' => $code,
            'qr_type' => $prefix === 'M' ? 'mother' : 'newborn',
            'token_hash' => $hashedToken,
            'image_path' => 'qrcodes/' . $filename,
            'status' => 'active',
        ]);
    }
}
