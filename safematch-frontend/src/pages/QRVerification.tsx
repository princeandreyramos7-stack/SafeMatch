import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, BarChart3, RefreshCw, QrCode, Users, Baby } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { format } from 'date-fns';

export default function QRVerification() {
  const [step, setStep] = useState<'mother' | 'newborn' | 'result'>('mother');
  const [motherQRData, setMotherQRData] = useState<any>(null);
  const [newbornQRData, setNewbornQRData] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/qr-verification/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleMotherScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      console.log('Mother QR Data:', qrData);
      
      if (qrData.type !== 'mother') {
        // Detect if it's a newborn QR code
        if (qrData.type === 'newborn') {
          toast.error('⚠️ Newborn QR Detected! You scanned a NEWBORN QR code. Please scan a MOTHER QR code in this scanner.', { 
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
              border: '2px solid #f59e0b',
            },
            icon: '👶',
          });
        } else {
          toast.error('⚠️ Wrong QR Code! This is NOT a Mother QR code. Please scan a Mother QR code.', { 
            duration: 4000,
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
            },
            icon: '🚫',
          });
        }
        return;
      }
      
      setMotherQRData(qrData);
      setStep('newborn');
      toast.success('✅ Mother QR Code Scanned Successfully!', { 
        icon: '👩',
        duration: 3000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
      });
    } catch (error) {
      toast.error('❌ Invalid QR code format. Please scan a valid SafeMatch QR code.', {
        duration: 3000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
        },
      });
    }
  };

  const handleNewbornScan = async (data: string) => {
    try {
      const qrData = JSON.parse(data);
      console.log('Newborn QR Data:', qrData);
      
      if (qrData.type !== 'newborn') {
        // Detect if it's a mother QR code
        if (qrData.type === 'mother') {
          toast.error('⚠️ Mother QR Detected! You scanned a MOTHER QR code. Please scan a NEWBORN QR code in this scanner.', { 
            duration: 5000,
            style: {
              background: '#fef3c7',
              color: '#92400e',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
              border: '2px solid #f59e0b',
            },
            icon: '👩',
          });
        } else {
          toast.error('⚠️ Wrong QR Code! This is NOT a Newborn QR code. Please scan a Newborn QR code.', { 
            duration: 4000,
            style: {
              background: '#fee2e2',
              color: '#991b1b',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
            },
            icon: '🚫',
          });
        }
        return;
      }
      
      setNewbornQRData(qrData);
      setLoading(true);

      // Verify pairing
      const response = await axios.post('/qr-verification/verify-pairing', {
        mother_qr_data: JSON.stringify(motherQRData),
        newborn_qr_data: data,
      });

      setVerificationResult(response.data);
      setStep('result');
      fetchStatistics();
      
      if (response.data.match) {
        toast.success('✅ MATCH VERIFIED! Mother and Newborn pair confirmed!', { 
          icon: '✔️',
          duration: 5000,
          style: {
            background: '#d1fae5',
            color: '#065f46',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
          },
        });
      } else {
        toast.error('🚨 MISMATCH DETECTED! The QR codes DO NOT match! This newborn does NOT belong to this mother!', { 
          icon: '❌',
          duration: 6000,
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
            border: '3px solid #dc2626',
          },
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error('❌ ' + errorMessage, {
        duration: 4000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          fontWeight: 'bold',
        },
      });
      
      setVerificationResult({
        success: false,
        match: false,
        message: errorMessage,
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setMotherQRData(null);
    setNewbornQRData(null);
    setVerificationResult(null);
    setStep('mother');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-8 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/10 rounded-full -ml-12 sm:-ml-24 -mb-12 sm:-mb-24"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3 animate-fade-in">
              <QrCode className="w-7 h-7 sm:w-10 sm:h-10" />
              QR Verification
            </h1>
            <p className="text-white/90 text-sm sm:text-lg animate-slide-up">Scan QR codes to verify mother-newborn pairing</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-soft-lg p-4 sm:p-8 border border-gray-100">
          {step === 'result' && verificationResult ? (
            /* Verification Result */
            <div className="text-center py-8 animate-scale-in">
              {verificationResult.match ? (
                /* ✓ MATCH - SUCCESS */
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-success rounded-full opacity-10 animate-pulse-slow"></div>
                    </div>
                    <CheckCircle2 className="w-32 h-32 text-success mx-auto relative z-10 animate-bounce-soft" />
                  </div>
                  
                  <div>
                    <h2 className="text-5xl font-bold text-success mb-3 animate-fade-in">✓ VERIFIED</h2>
                    <p className="text-2xl text-gray-700 font-medium animate-slide-up">{verificationResult.message}</p>
                  </div>
                  
                  <div className="max-w-3xl mx-auto bg-gradient-to-br from-success-light to-green-50 rounded-2xl p-8 text-left space-y-6 shadow-soft border-2 border-success">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <p className="text-success-dark font-bold text-lg">Mother-Baby Pairing Confirmed</p>
                    </div>
                    
                    <div className="border-b-2 border-green-200 pb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl">Mother Information</h3>
                      </div>
                      <div className="space-y-3 pl-13">
                        <p className="text-gray-900 font-bold text-2xl">{verificationResult.mother?.full_name}</p>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                            ID: {verificationResult.mother?.mother_id}
                          </span>
                          <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                            DOB: {verificationResult.mother?.date_of_birth ? 
                              format(new Date(verificationResult.mother.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                          <Baby className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl">Newborn Information</h3>
                      </div>
                      <div className="space-y-3 pl-13">
                        <p className="text-gray-900 font-bold text-2xl">
                          {verificationResult.newborn?.full_name || 'Baby of ' + verificationResult.mother?.full_name}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                            ID: {verificationResult.newborn?.newborn_id}
                          </span>
                          <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                            Sex: {verificationResult.newborn?.sex}
                          </span>
                          <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                            DOB: {verificationResult.newborn?.date_of_birth ? 
                              format(new Date(verificationResult.newborn.date_of_birth), 'MMM dd, yyyy HH:mm') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ✗ MISMATCH - ERROR */
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-error rounded-full opacity-10 animate-pulse-slow"></div>
                    </div>
                    <XCircle className="w-32 h-32 text-error mx-auto relative z-10 animate-bounce-soft" />
                  </div>
                  
                  <div>
                    <h2 className="text-5xl font-bold text-error mb-3 animate-fade-in">✗ MISMATCH</h2>
                    <p className="text-2xl text-gray-700 font-medium animate-slide-up">{verificationResult.message}</p>
                  </div>
                  
                  <div className="max-w-3xl mx-auto bg-gradient-to-br from-error-light to-red-50 rounded-2xl p-8 text-left space-y-6 shadow-soft-lg border-4 border-error animate-pulse-slow">
                    <div className="flex items-start gap-4 p-5 bg-gradient-error rounded-xl text-white">
                      <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-1 animate-bounce-soft" />
                      <div>
                        <p className="font-bold text-xl mb-2">⚠️ CRITICAL ALERT: Mismatch Detected</p>
                        <p className="text-white/90 text-base">
                          The scanned newborn <strong>DOES NOT BELONG</strong> to the scanned mother. 
                          This could be a patient safety issue. Please verify immediately and notify supervisor.
                        </p>
                      </div>
                    </div>
                    
                    {verificationResult.mother && (
                      <div className="border-b-2 border-red-200 pb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                            <Users className="w-5 h-5 text-gray-700" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-xl">Scanned Mother</h3>
                        </div>
                        <div className="space-y-3 pl-13">
                          <p className="text-gray-900 font-bold text-2xl">{verificationResult.mother?.full_name}</p>
                          <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                              ID: {verificationResult.mother?.mother_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {verificationResult.newborn && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft">
                            <Baby className="w-5 h-5 text-gray-700" />
                          </div>
                          <h3 className="font-bold text-gray-900 text-xl">Scanned Newborn</h3>
                        </div>
                        <div className="space-y-3 pl-13">
                          <p className="text-gray-900 font-bold text-2xl">
                            {verificationResult.newborn?.full_name || 'Unnamed Baby'}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 shadow-soft">
                              ID: {verificationResult.newborn?.newborn_id}
                            </span>
                          </div>
                          {verificationResult.newborn?.expected_mother_name && (
                            <div className="mt-4 p-4 bg-white rounded-xl border-2 border-error">
                              <p className="text-sm font-semibold text-error-dark mb-1">Expected Mother:</p>
                              <p className="text-lg font-bold text-error">
                                {verificationResult.newborn.expected_mother_name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={resetVerification}
                className="mt-10 px-10 py-4 bg-gradient-primary text-white rounded-xl hover:shadow-glow transition-all-smooth font-bold text-lg flex items-center gap-3 mx-auto group"
              >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                Scan Another Pair
              </button>
            </div>
          ) : (
            /* QR Scanner */
            <div className="animate-fade-in">
              {/* Progress Steps */}
              <div className="mb-6 sm:mb-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                  <div className={`flex items-center gap-3 sm:gap-4 transition-all-smooth ${
                    step === 'mother' ? 'scale-105 sm:scale-110' : ''
                  }`}>
                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all-smooth ${
                      step === 'mother' ? 'bg-gradient-primary text-white shadow-glow animate-pulse-slow' : 
                      motherQRData ? 'bg-gradient-success text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {motherQRData ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" /> : '1'}
                      {step === 'mother' && (
                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className={`block text-base sm:text-lg font-bold transition-colors ${
                        step === 'mother' ? 'text-primary' : motherQRData ? 'text-success' : 'text-gray-400'
                      }`}>
                        Scan Mother QR
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">Step 1 of 2</span>
                    </div>
                  </div>
                  
                  <div className={`w-16 sm:w-24 h-1 sm:h-2 rounded-full transition-all-smooth rotate-90 sm:rotate-0 ${
                    motherQRData ? 'bg-gradient-primary' : 'bg-gray-200'
                  }`}></div>
                  
                  <div className={`flex items-center gap-3 sm:gap-4 transition-all-smooth ${
                    step === 'newborn' ? 'scale-105 sm:scale-110' : ''
                  }`}>
                    <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all-smooth ${
                      step === 'newborn' ? 'bg-gradient-primary text-white shadow-glow animate-pulse-slow' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                      {step === 'newborn' && (
                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-25"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className={`block text-base sm:text-lg font-bold transition-colors ${
                        step === 'newborn' ? 'text-primary' : 'text-gray-400'
                      }`}>
                        Scan Newborn QR
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">Step 2 of 2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanner */}
              {loading ? (
                <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl sm:rounded-2xl">
                  <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-primary animate-spin mx-auto mb-4 sm:mb-6" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 px-4">Verifying Pairing...</p>
                  <p className="text-sm sm:text-base text-gray-600 px-4">Please wait while we match the QR codes</p>
                  <div className="mt-4 sm:mt-6 max-w-xs mx-auto bg-white rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-primary h-full rounded-full animate-pulse-slow" style={{ width: '70%' }}></div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-dashed border-primary-300">
                  <QRScanner
                    onScan={step === 'mother' ? handleMotherScan : handleNewbornScan}
                    label={step === 'mother' ? '📱 Step 1: Scan Mother QR Code' : '👶 Step 2: Scan Newborn QR Code'}
                    autoStart={true}
                  />
                </div>
              )}

              {/* Back Button */}
              {step === 'newborn' && !loading && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setMotherQRData(null);
                      setStep('mother');
                      toast.info('↩️ Restarting - scan mother QR code first', {
                        icon: '🔄'
                      });
                    }}
                    className="text-gray-600 hover:text-primary underline font-semibold text-lg flex items-center gap-2 mx-auto transition-colors group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    ← Back to scan mother QR
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
