import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, XCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  label?: string;
}

export default function QRScanner({ onScan, label = 'Scan QR Code' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera if available
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes('back')
          );
          setSelectedCamera(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('No camera detected. Please ensure camera permissions are granted.');
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera selected');
      return;
    }

    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          stopScanning();
          onScan(decodedText);
        },
        (errorMessage) => {
          // Scanning error (usually just "no QR code found")
          // We don't show this to avoid spam
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
        <p className="text-sm text-gray-600">
          {isScanning
            ? 'Point your camera at the QR code'
            : 'Click "Start Camera" to begin scanning'}
        </p>
      </div>

      {/* Camera Selection */}
      {cameras.length > 1 && !isScanning && (
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Scanner Display */}
      <div className="max-w-md mx-auto">
        <div
          id="qr-reader"
          className={`rounded-lg overflow-hidden ${
            isScanning ? 'border-4 border-primary' : 'border-2 border-gray-300'
          }`}
          style={{ minHeight: isScanning ? 'auto' : '300px' }}
        >
          {!isScanning && (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-md mx-auto flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Camera Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="text-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            disabled={!selectedCamera}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Stop Camera
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">📱 Scanning Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Hold the QR code steady and well-lit</li>
          <li>Keep the camera 10-20cm from the QR code</li>
          <li>Ensure the QR code fits within the scan box</li>
          <li>Scan will happen automatically when detected</li>
        </ul>
      </div>
    </div>
  );
}
