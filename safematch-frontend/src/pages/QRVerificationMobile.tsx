import { useState } from 'react';
import { Camera, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function QRVerificationMobile() {
  const [motherScanned, setMotherScanned] = useState(false);
  const [babyScanned, setBabyScanned] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'waiting' | 'match' | 'no-match'>('waiting');

  const handleScanBaby = () => {
    setBabyScanned(true);
    if (motherScanned) {
      // Simulate match check
      setMatchStatus('match');
    }
  };

  const handleScanMother = () => {
    setMotherScanned(true);
    if (babyScanned) {
      // Simulate match check
      setMatchStatus('match');
    }
  };

  const handleDemoMother = (id: string) => {
    setMotherScanned(true);
    if (babyScanned) {
      setMatchStatus('match');
    }
  };

  const handleDemoBaby = (id: string) => {
    setBabyScanned(true);
    if (motherScanned) {
      setMatchStatus('match');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-teal-700 text-white p-4 shadow-lg">
        <h1 className="text-lg font-semibold">SafeMatch - Mother-Baby Identification</h1>
      </div>

      {/* Prototype Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
        <div className="flex items-start">
          <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800">Prototype only:</p>
            <p className="text-xs text-yellow-700 mt-1">
              This simulation demonstrates the matching concept. It is not a real hospital patient-record system and should not be used for actual patient identification.
            </p>
          </div>
        </div>
      </div>

      {/* ID Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Baby Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👶</span>
            <h2 className="text-lg font-bold text-gray-900">Baby Identification</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Scan the QR code on the baby's identification band.
          </p>

          <div className="bg-gray-100 rounded-lg p-8 mb-4 text-center">
            {babyScanned ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="text-green-600 mb-2" size={48} />
                <p className="text-lg font-semibold text-gray-900">Scanned ✓</p>
              </div>
            ) : (
              <p className="text-xl font-semibold text-gray-600">Not scanned</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleScanBaby}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Camera size={20} />
              Scan Baby QR
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoBaby('B001')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm transition-colors"
              >
                Demo: Baby B001
              </button>
              <button
                onClick={() => handleDemoBaby('B002')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm transition-colors"
              >
                Demo: Baby B002
              </button>
            </div>
          </div>
        </div>

        {/* Mother Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👩</span>
            <h2 className="text-lg font-bold text-gray-900">Mother Identification</h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Scan the QR code on the mother's identification band.
          </p>

          <div className="bg-gray-100 rounded-lg p-8 mb-4 text-center">
            {motherScanned ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="text-green-600 mb-2" size={48} />
                <p className="text-lg font-semibold text-gray-900">Scanned ✓</p>
              </div>
            ) : (
              <p className="text-xl font-semibold text-gray-600">Not scanned</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleScanMother}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Camera size={20} />
              Scan Mother QR
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoMother('M001')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm transition-colors"
              >
                Demo: Mother M001
              </button>
              <button
                onClick={() => handleDemoMother('M002')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded text-sm transition-colors"
              >
                Demo: Mother M002
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="px-4 mb-6">
        <div className={`rounded-lg p-6 text-center ${
          matchStatus === 'waiting' ? 'bg-gray-100' :
          matchStatus === 'match' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          {matchStatus === 'waiting' && (
            <>
              <p className="text-xl font-bold text-gray-900 mb-2">WAITING FOR TWO IDs</p>
              <p className="text-sm text-gray-600">Scan/select both the baby and mother IDs to verify the match.</p>
            </>
          )}
          {matchStatus === 'match' && (
            <>
              <CheckCircle className="mx-auto text-green-600 mb-3" size={64} />
              <p className="text-2xl font-bold text-green-900 mb-2">VERIFIED</p>
              <p className="text-sm text-green-800 mt-2">✓ Mother-baby pair matched - Both QR tokens are valid and share the same registered relationship.</p>
            </>
          )}
          {matchStatus === 'no-match' && (
            <>
              <XCircle className="mx-auto text-red-600 mb-3" size={64} />
              <p className="text-2xl font-bold text-red-900 mb-2">STOP and VERIFY</p>
              <p className="text-sm text-red-800">The scanned IDs do not match the registered pair.</p>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white mx-4 mb-6 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How the simulation works</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>1. Each mother and baby receives a unique ID.</li>
          <li>2. Each ID is represented by a QR code on the identification band.</li>
          <li>3. The website reads the two IDs.</li>
          <li>4. The system checks the pre-set matching record.</li>
          <li>5. A green result means the pair matches; a red result means STOP and VERIFY.</li>
        </ol>
      </div>

      {/* Sample QR Codes Section */}
      <div className="bg-white mx-4 mb-6 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sample QR Codes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Print these or show them on another phone for your presentation.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Mother M001', 'Baby B001', 'Mother M002', 'Baby B002'].map((label, idx) => (
            <div key={idx} className="text-center">
              <div className="bg-gray-200 h-32 rounded-lg mb-2 flex items-center justify-center">
                <div className="w-24 h-24 bg-white"></div>
              </div>
              <p className="text-xs font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-500">{label.replace(' ', '.')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
