import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, XCircle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  label?: string;
  autoStart?: boolean;
}

export default function QRScanner({ onScan, label = 'Scan QR Code', autoStart = true }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScannedRef = useRef<string>('');
  const scanCooldownRef = useRef<boolean>(false);

  useEffect(() => {
    // Suppress ZXing console noise - patch console.log as well since MultiFormatReader uses it
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const shouldSuppress = (message: string) => {
      return message.includes('MultiFormatReader') ||
             message.includes('NotFoundException') ||
             message.includes('ChecksumException') ||
             message.includes('FormatException') ||
             message.includes('No Micro QR') ||
             message.includes('non-ReaderException');
    };
    
    console.log = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (!shouldSuppress(message)) {
        originalConsoleLog.apply(console, args);
      }
    };
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (!shouldSuppress(message)) {
        originalConsoleError.apply(console, args);
      }
    };
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (!shouldSuppress(message)) {
        originalConsoleWarn.apply(console, args);
      }
    };
    
    // Initialize code reader with hints to reduce scanning noise
    codeReaderRef.current = new BrowserMultiFormatReader();
    
    // Get available cameras
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        if (videoDevices.length > 0) {
          // Prefer back camera
          const backCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear')
          );
          const cameraId = backCamera?.deviceId || videoDevices[0].deviceId;
          setSelectedCamera(cameraId);
          
          if (autoStart) {
            startScanning(cameraId);
          }
        } else {
          setError('No camera detected');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('Failed to access cameras. Please grant permission.');
      });

    return () => {
      stopScanning();
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const startScanning = async (cameraId?: string) => {
    const deviceId = cameraId || selectedCamera;
    
    if (!deviceId) {
      setError('No camera selected');
      return;
    }

    if (!videoRef.current) {
      setError('Video element not ready');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      lastScannedRef.current = ''; // Reset last scanned
      scanCooldownRef.current = false; // Reset cooldown

      const codeReader = codeReaderRef.current;
      if (!codeReader) return;

      await codeReader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result && !isProcessing && !scanCooldownRef.current) {
            const text = result.getText();
            
            // Prevent duplicate scans of the same QR code
            if (text === lastScannedRef.current) {
              return;
            }
            
            console.log('QR Code scanned:', text);
            
            // Try to parse as URL first (new format)
            if (text.startsWith('http')) {
              try {
                const url = new URL(text);
                const code = url.searchParams.get('code');
                const token = url.searchParams.get('token');
                const type = url.searchParams.get('type');
                
                if (code && token && type) {
                  // Convert URL format to JSON format for compatibility
                  const qrData = JSON.stringify({
                    code,
                    token,
                    type,
                    url: text
                  });
                  
                  // Mark as scanned
                  lastScannedRef.current = text;
                  scanCooldownRef.current = true;
                  
                  setIsProcessing(true);
                  stopScanning();
                  onScan(qrData);
                  
                  // Reset cooldown after 2 seconds
                  setTimeout(() => {
                    scanCooldownRef.current = false;
                    setIsProcessing(false);
                  }, 2000);
                  return;
                }
              } catch (e) {
                // Not a valid URL, continue
              }
            }
            
            // Try to parse as JSON (old format)
            try {
              const qrData = JSON.parse(text);
              if (!qrData.code || !qrData.token || !qrData.type) {
                return;
              }
              
              // Mark as scanned
              lastScannedRef.current = text;
              scanCooldownRef.current = true;
              
              setIsProcessing(true);
              stopScanning();
              onScan(text);
              
              // Reset cooldown after 2 seconds
              setTimeout(() => {
                scanCooldownRef.current = false;
                setIsProcessing(false);
              }, 2000);
            } catch (e) {
              // Not valid JSON or SafeMatch QR code
            }
          }
          
          // Don't log scanning errors - they're normal
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    try {
      // Stop all video streams
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.error('Error stopping scanner:', e);
    }
    setIsScanning(false);
  };

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    stopScanning();
    setTimeout(() => startScanning(cameraId), 300);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
        <p className="text-sm text-gray-600">
          {isProcessing
            ? 'Processing QR code...'
            : isScanning
            ? 'Position the QR code in front of the camera'
            : 'Click "Start Camera" to begin scanning'}
        </p>
      </div>

      {/* Camera Selection */}
      {cameras.length > 1 && (
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Display */}
      <div className="max-w-md mx-auto">
        <div
          className={`rounded-lg overflow-hidden ${
            isScanning ? 'border-4 border-primary shadow-lg' : 'border-2 border-gray-300'
          }`}
          style={{ minHeight: '300px', background: '#000' }}
        >
          <video
            ref={videoRef}
            className="w-full h-full"
            style={{ 
              display: isScanning ? 'block' : 'none',
              objectFit: 'cover',
              minHeight: '300px'
            }}
          />
          {!isScanning && (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <Camera className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-md mx-auto">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Camera Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setError(null);
                startScanning();
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {!isScanning && !error && (
        <div className="text-center">
          <button
            onClick={() => startScanning()}
            disabled={!selectedCamera}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            Start Camera
          </button>
        </div>
      )}

      {isScanning && !isProcessing && (
        <div className="text-center">
          <button
            onClick={stopScanning}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Stop Camera
          </button>
        </div>
      )}

      {/* Scanning Status */}
      {isScanning && !isProcessing && (
        <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Camera Active - Scanning...</p>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <p className="text-sm font-medium">Processing QR Code...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">📱 Scanning Tips:</p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Hold the QR code steady and well-lit</li>
          <li>Keep the camera 10-20cm from the QR code</li>
          <li>Ensure the entire QR code is visible</li>
          <li>Scan will happen automatically when detected</li>
        </ul>
      </div>
    </div>
  );
}
