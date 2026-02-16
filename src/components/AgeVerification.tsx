import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AgeVerification() {
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (!verified) {
      setIsVerified(false);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setIsVerified(true);
  };

  if (isVerified) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Age Verification Required
        </h2>

        <p className="text-lg text-gray-700 mb-6">
          You must be 18 years or older to access this website.
        </p>

        <button
          onClick={handleConfirm}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg mb-4"
        >
          I am 18 or older - Enter Site
        </button>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold mb-2">⚠️ Adult Content Warning</p>
          <p>
            This website contains adult-oriented material and is intended for mature audiences only.
            By clicking the button above, you confirm that you are at least 18 years of age and
            agree to view adult content.
          </p>
        </div>
      </div>
    </div>
  );
}
