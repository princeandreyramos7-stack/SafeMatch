import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { X, Baby, User, Calendar, Activity, QrCode, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface NewbornDetailsProps {
  newbornId: number;
  onClose: () => void;
}

export default function NewbornDetails({ newbornId, onClose }: NewbornDetailsProps) {
  const [newborn, setNewborn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [newbornId]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`/newborns/${newbornId}`);
      setNewborn(response.data);
    } catch (error) {
      alert('Failed to load details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      setGeneratingQR(true);
      await axios.post('/qr-codes/generate', {
        type: 'newborn',
        id: newbornId,
      });
      
      alert('QR code generated successfully!');
      setShowQRModal(true);
      fetchDetails();
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      alert(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!newborn?.qr_code?.id) return;

    try {
      const response = await axios.get(`/qr-codes/${newborn.qr_code.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-${newborn.newborn_id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code');
    }
  };

  const handlePrintQR = () => {
    if (!newborn?.qr_code?.id) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${newborn.newborn_id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .header {
                margin-bottom: 20px;
              }
              .qr-container {
                margin: 20px auto;
              }
              .info {
                margin-top: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SafeMatch QR Code</h1>
              <h2>Newborn Identification</h2>
            </div>
            <div class="qr-container">
              <img src="${import.meta.env.VITE_API_URL}/api/qr-codes/${newborn.qr_code.id}/image" alt="QR Code" style="width: 300px; height: 300px;" />
            </div>
            <div class="info">
              <p><strong>Newborn ID:</strong> ${newborn.newborn_id}</p>
              <p><strong>Name:</strong> ${newborn.full_name || 'Unnamed'}</p>
              <p><strong>Sex:</strong> ${newborn.sex}</p>
              <p><strong>Mother:</strong> ${newborn.mother?.full_name || 'Unknown'}</p>
              <p><strong>QR Code:</strong> ${newborn.qr_code.code}</p>
              <p><strong>Generated:</strong> ${format(new Date(newborn.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!newborn) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Newborn Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Baby className="w-5 h-5"/>Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Newborn ID</p><p className="font-mono font-semibold">{newborn.newborn_id}</p></div>
              <div><p className="text-sm text-gray-500">Full Name</p><p className="font-semibold">{newborn.full_name || 'Unnamed'}</p></div>
              <div><p className="text-sm text-gray-500">Sex</p><p>{newborn.sex}</p></div>
              <div><p className="text-sm text-gray-500">Date & Time of Birth</p><p>{format(new Date(newborn.date_time_of_birth), 'MMM dd, yyyy HH:mm')}</p></div>
            </div>
          </div>

          {/* Mother Info */}
          {newborn.mother && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5"/>Mother Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Mother's Name</p><p className="font-semibold">{newborn.mother.full_name}</p></div>
                <div><p className="text-sm text-gray-500">Mother ID</p><p className="font-mono">{newborn.mother.mother_id}</p></div>
              </div>
            </div>
          )}

          {/* Birth Metrics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5"/>Birth Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500">Weight</p><p className="text-lg font-semibold">{newborn.birth_weight ? `${newborn.birth_weight}g` : '-'}</p></div>
              <div><p className="text-sm text-gray-500">Length</p><p className="text-lg font-semibold">{newborn.birth_length ? `${newborn.birth_length}cm` : '-'}</p></div>
              <div><p className="text-sm text-gray-500">Head Circ.</p><p className="text-lg font-semibold">{newborn.birth_head_circumference ? `${newborn.birth_head_circumference}cm` : '-'}</p></div>
            </div>
            {newborn.delivery_info && (
              <div className="mt-4"><p className="text-sm text-gray-500 mb-2">Delivery Information</p><p className="text-sm whitespace-pre-wrap">{newborn.delivery_info}</p></div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><QrCode className="w-5 h-5"/>QR Code Status</h3>
            {newborn.qr_code ? (
              <div className="space-y-4">
                <div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">QR Code Active</span>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Code:</span> {newborn.qr_code.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={newborn.qr_code.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {newborn.qr_code.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Generated:</span>{' '}
                      {format(new Date(newborn.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR Code
                  </button>
                  <button
                    onClick={handleDownloadQR}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handlePrintQR}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">QR Code Not Generated</span>
                  <p className="text-sm text-gray-600 mt-2">Generate a unique QR code for newborn identification</p>
                </div>
                <button
                  onClick={handleGenerateQR}
                  disabled={generatingQR}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-4 h-4" />
                  {generatingQR ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>
            )}
          </div>

          {/* Screenings */}
          {newborn.screenings && newborn.screenings.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Screenings</h3>
              <div className="space-y-2">
                {newborn.screenings.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex justify-between p-2 bg-white rounded">
                    <div><p className="text-sm font-medium">{s.screening_type?.name || 'Screening'}</p>
                      <p className="text-xs text-gray-500">{s.performed_date && format(new Date(s.performed_date), 'MMM dd, yyyy')}</p></div>
                    <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && newborn?.qr_code && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">QR Code Preview</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block">
                <img
                  src={`${import.meta.env.VITE_API_URL}/api/qr-codes/${newborn.qr_code.id}/image`}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="mt-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Newborn ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{newborn.newborn_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{newborn.full_name || 'Unnamed'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mother:</span>
                  <span className="text-gray-900">{newborn.mother?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">QR Code:</span>
                  <span className="font-mono font-semibold text-gray-900">{newborn.qr_code.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generated:</span>
                  <span className="text-gray-900">
                    {format(new Date(newborn.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
