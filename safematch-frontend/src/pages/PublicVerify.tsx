import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, AlertTriangle, Home } from 'lucide-react';

export default function PublicVerify() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyQRCode();
  }, []);

  const verifyQRCode = async () => {
    const code = searchParams.get('code');
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!code || !token || !type) {
      setError('Invalid QR code. Missing required parameters.');
      setLoading(false);
      return;
    }

    try {
      // Create the QR data format expected by the API
      const qrData = JSON.stringify({
        code,
        token,
        type
      });

      // Call the verification API
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/qr-verification/verify-single`,
        { qr_data: qrData }
      );

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SafeMatch</h1>
          <p className="text-gray-600">Mother-Baby Identification System</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying QR Code...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
              <p className="text-gray-700 mb-8">{error}</p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Login
                </Link>
              </div>
            </div>
          ) : result?.success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-green-600 mb-6">✓ VERIFIED</h2>
              
              <div className="bg-green-50 rounded-xl p-6 text-left space-y-4 mb-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Patient Type</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{result.type}</p>
                </div>
                
                <div className="border-t border-green-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Full Name</h3>
                  <p className="text-xl font-bold text-gray-900">{result.record?.full_name || 'Unnamed'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Patient ID</h3>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {result.record?.mother_id || result.record?.newborn_id}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">QR Code</h3>
                  <p className="text-lg font-mono font-semibold text-gray-900">{result.qr_code?.code}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Active & Valid
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900">Information Notice</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This QR code has been successfully verified. For patient safety, always verify 
                      mother-baby pairing through the official SafeMatch system.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                <Home className="w-5 h-5" />
                Go to SafeMatch System
              </Link>
            </div>
          ) : (
            <div className="text-center py-12">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid QR Code</h2>
              <p className="text-gray-700 mb-8">
                {result?.message || 'This QR code could not be verified. It may be expired or invalid.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>SafeMatch © 2026 - Mother-Baby Identification System</p>
          <p className="mt-1">Scan QR codes to verify patient identification</p>
        </div>
      </div>
    </div>
  );
}
