import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Camera, CheckCircle2, XCircle, AlertTriangle, History, BarChart3 } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { format } from 'date-fns';

export default function QRVerification() {
  const [mode, setMode] = useState<'single' | 'pairing'>('pairing');
  const [step, setStep] = useState<'mother' | 'newborn' | 'result'>('mother');
  const [motherQRData, setMotherQRData] = useState<string | null>(null);
  const [newbornQRData, setNewbornQRData] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
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

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/qr-verification/history');
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleMotherScan = (data: string) => {
    setMotherQRData(data);
    setStep('newborn');
  };

  const handleNewbornScan = async (data: string) => {
    setNewbornQRData(data);
    setLoading(true);

    try {
      const response = await axios.post('/qr-verification/verify-pairing', {
        mother_qr_data: motherQRData,
        newborn_qr_data: data,
      });

      setVerificationResult(response.data);
      setStep('result');
      fetchStatistics(); // Refresh stats
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        match: false,
        message: error.response?.data?.message || 'Verification failed',
      });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleScan = async (data: string) => {
    setLoading(true);

    try {
      const response = await axios.post('/qr-verification/verify-single', {
        qr_data: data,
      });

      setVerificationResult(response.data);
      setStep('result');
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || 'Verification failed',
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

  const toggleHistory = () => {
    if (!showHistory) {
      fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Verification</h1>
          <p className="text-gray-600 mt-1">Scan QR codes to verify patient identification</p>
        </div>
        <button
          onClick={toggleHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          {showHistory ? <Camera className="w-5 h-5" /> : <History className="w-5 h-5" />}
          {showHistory ? 'Scanner' : 'View History'}
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Verifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total_verifications}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Matches</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statistics.matches}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">No Matches</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{statistics.no_matches}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Match Rate</p>
                <p className="text-2xl font-bold text-primary mt-1">{statistics.match_rate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      )}

      {showHistory ? (
        /* History View */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Verification History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Newborn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(record.verified_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.mother_qr_code?.qrcodeable?.full_name || 'Unknown'}
                      <p className="text-xs text-gray-500">{record.mother_qr_code?.qrcodeable?.mother_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.newborn_qr_code?.qrcodeable?.full_name || 'Unnamed'}
                      <p className="text-xs text-gray-500">{record.newborn_qr_code?.qrcodeable?.newborn_id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.verification_result === 'match' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle2 className="w-4 h-4" />
                          Match
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4" />
                          No Match
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.verified_by?.name || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No verification history yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Scanner View */
        <div className="bg-white rounded-lg shadow p-6">
          {/* Mode Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setMode('pairing');
                resetVerification();
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                mode === 'pairing'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mother-Newborn Pairing
            </button>
            <button
              onClick={() => {
                setMode('single');
                resetVerification();
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                mode === 'single'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single QR Verification
            </button>
          </div>

          {/* Scanner or Result */}
          {step === 'result' && verificationResult ? (
            /* Verification Result */
            <div className="text-center py-12">
              {mode === 'pairing' ? (
                /* Pairing Result */
                <div>
                  {verificationResult.match ? (
                    <div>
                      <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-green-600 mb-4">✓ MATCH</h2>
                      <p className="text-lg text-gray-700 mb-8">{verificationResult.message}</p>
                      
                      <div className="max-w-2xl mx-auto bg-green-50 rounded-lg p-6 text-left space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Mother Information:</h3>
                          <p className="text-gray-700">{verificationResult.mother?.full_name}</p>
                          <p className="text-sm text-gray-600">ID: {verificationResult.mother?.mother_id}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Newborn Information:</h3>
                          <p className="text-gray-700">{verificationResult.newborn?.full_name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-600">ID: {verificationResult.newborn?.newborn_id}</p>
                          <p className="text-sm text-gray-600">Sex: {verificationResult.newborn?.sex}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-red-600 mb-4">✗ NO MATCH</h2>
                      <p className="text-lg text-gray-700 mb-8">{verificationResult.message}</p>
                      
                      <div className="max-w-2xl mx-auto bg-red-50 rounded-lg p-6 text-left space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-900">Warning: Mismatch Detected</p>
                            <p className="text-sm text-red-700 mt-1">
                              The scanned newborn does not belong to the scanned mother.
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Scanned Mother:</h3>
                          <p className="text-gray-700">{verificationResult.mother?.full_name}</p>
                          <p className="text-sm text-gray-600">ID: {verificationResult.mother?.mother_id}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Scanned Newborn:</h3>
                          <p className="text-gray-700">{verificationResult.newborn?.full_name || 'Unnamed'}</p>
                          <p className="text-sm text-gray-600">ID: {verificationResult.newborn?.newborn_id}</p>
                          <p className="text-sm text-red-600 font-medium mt-2">
                            Actual Mother: {verificationResult.newborn?.expected_mother_name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Verification Result */
                <div>
                  {verificationResult.success ? (
                    <div>
                      <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-green-600 mb-4">✓ VERIFIED</h2>
                      <p className="text-lg text-gray-700 mb-8">{verificationResult.message}</p>
                      
                      <div className="max-w-2xl mx-auto bg-green-50 rounded-lg p-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Record Information:</h3>
                        <p className="text-gray-700 font-semibold">{verificationResult.record?.full_name}</p>
                        <p className="text-sm text-gray-600">
                          ID: {verificationResult.record?.mother_id || verificationResult.record?.newborn_id}
                        </p>
                        <p className="text-sm text-gray-600">Type: {verificationResult.type}</p>
                        <p className="text-sm text-gray-600">QR Code: {verificationResult.qr_code?.code}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-red-600 mb-4">✗ FAILED</h2>
                      <p className="text-lg text-gray-700 mb-8">{verificationResult.message}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={resetVerification}
                className="mt-8 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
              >
                Scan Another
              </button>
            </div>
          ) : (
            /* QR Scanner */
            <div>
              {mode === 'pairing' && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className={`flex items-center gap-2 ${step === 'mother' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'mother' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        1
                      </div>
                      <span>Mother QR</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${step === 'newborn' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'newborn' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        2
                      </div>
                      <span>Newborn QR</span>
                    </div>
                  </div>
                </div>
              )}

              <QRScanner
                onScan={mode === 'single' ? handleSingleScan : step === 'mother' ? handleMotherScan : handleNewbornScan}
                label={mode === 'single' ? 'Scan QR Code' : step === 'mother' ? 'Scan Mother QR Code' : 'Scan Newborn QR Code'}
              />

              {mode === 'pairing' && step === 'newborn' && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setMotherQRData(null);
                      setStep('mother');
                    }}
                    className="text-gray-600 hover:text-gray-900 underline"
                  >
                    ← Back to scan mother QR
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
