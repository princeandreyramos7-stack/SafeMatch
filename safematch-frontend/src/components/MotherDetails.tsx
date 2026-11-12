import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { X, User, Phone, MapPin, Calendar, FileText, QrCode, Baby, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';

interface MotherDetailsProps {
  motherId: number;
  onClose: () => void;
}

export default function MotherDetails({ motherId, onClose }: MotherDetailsProps) {
  const [mother, setMother] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchMotherDetails();
  }, [motherId]);

  const fetchMotherDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/mothers/${motherId}`);
      setMother(response.data);
    } catch (error) {
      console.error('Error fetching mother details:', error);
      alert('Failed to load mother details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      setGeneratingQR(true);
      const response = await axios.post('/qr-codes/generate', {
        type: 'mother',
        id: motherId,
      });
      
      alert('QR code generated successfully!');
      setShowQRModal(true);
      fetchMotherDetails(); // Refresh to get new QR code
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      alert(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!mother?.qr_code?.id) return;

    try {
      const response = await axios.get(`/qr-codes/${mother.qr_code.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr-${mother.mother_id}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code');
    }
  };

  const handlePrintQR = () => {
    if (!mother?.qr_code?.id) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${mother.mother_id}</title>
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
              <h2>Mother Identification</h2>
            </div>
            <div class="qr-container">
              <img src="${import.meta.env.VITE_API_URL}/api/qr-codes/${mother.qr_code.id}/image" alt="QR Code" style="width: 300px; height: 300px;" />
            </div>
            <div class="info">
              <p><strong>Mother ID:</strong> ${mother.mother_id}</p>
              <p><strong>Name:</strong> ${mother.full_name}</p>
              <p><strong>QR Code:</strong> ${mother.qr_code.code}</p>
              <p><strong>Generated:</strong> ${format(new Date(mother.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}</p>
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
        <div className="bg-white rounded-lg shadow-xl p-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!mother) return null;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Mother Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Mother ID</p>
                  <p className="text-base font-mono font-semibold text-gray-900">{mother.mother_id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-semibold text-gray-900">{mother.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-base text-gray-900">
                    {format(new Date(mother.date_of_birth), 'MMM dd, yyyy')} ({calculateAge(mother.date_of_birth)} years old)
                  </p>
                </div>
              </div>

              {mother.contact_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="text-base text-gray-900">{mother.contact_number}</p>
                  </div>
                </div>
              )}

              {mother.address && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-base text-gray-900">{mother.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admission Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mother.admission_date && (
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="text-base text-gray-900">
                    {format(new Date(mother.admission_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                  mother.status === 'active' ? 'bg-green-100 text-green-800' :
                  mother.status === 'discharged' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mother.status.charAt(0).toUpperCase() + mother.status.slice(1)}
                </span>
              </div>

              {mother.attending_personnel && (
                <div>
                  <p className="text-sm text-gray-500">Attending Personnel</p>
                  <p className="text-base text-gray-900">{mother.attending_personnel.name}</p>
                </div>
              )}

              {mother.admission_info && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Additional Information</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{mother.admission_info}</p>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Status
            </h3>
            {mother.qr_code ? (
              <div className="space-y-4">
                <div>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    QR Code Active
                  </span>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Code:</span> {mother.qr_code.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={mother.qr_code.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                        {mother.qr_code.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Generated:</span>{' '}
                      {format(new Date(mother.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}
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
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    QR Code Not Generated
                  </span>
                  <p className="text-sm text-gray-600 mt-2">Generate a unique QR code for patient identification</p>
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

          {/* Newborns */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Baby className="w-5 h-5" />
              Registered Newborns
            </h3>
            {mother.newborns && mother.newborns.length > 0 ? (
              <div className="space-y-3">
                {mother.newborns.map((newborn: any) => (
                  <div key={newborn.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {newborn.full_name || `Newborn ${newborn.newborn_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Born: {format(new Date(newborn.date_time_of_birth), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sex: {newborn.sex} | Weight: {newborn.birth_weight}g
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      newborn.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {newborn.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No newborns registered yet</p>
            )}
          </div>

          {/* Maternal Assessments */}
          {mother.maternal_assessments && mother.maternal_assessments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assessments</h3>
              <div className="space-y-2">
                {mother.maternal_assessments.slice(0, 5).map((assessment: any) => (
                  <div key={assessment.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {assessment.assessment_type?.name || 'Assessment'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(assessment.assessment_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      assessment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      assessment.status === 'requires_followup' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assessment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && mother?.qr_code && (
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
                  src={`${import.meta.env.VITE_API_URL}/api/qr-codes/${mother.qr_code.id}/image`}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="mt-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mother ID:</span>
                  <span className="font-mono font-semibold text-gray-900">{mother.mother_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{mother.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">QR Code:</span>
                  <span className="font-mono font-semibold text-gray-900">{mother.qr_code.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Generated:</span>
                  <span className="text-gray-900">
                    {format(new Date(mother.qr_code.generated_at), 'MMM dd, yyyy HH:mm')}
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
