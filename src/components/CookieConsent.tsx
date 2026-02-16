import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-[#FF1493]/10 rounded-lg mt-1">
              <Cookie className="w-6 h-6 text-[#FF1493]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                We use cookies
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                We use cookies and similar technologies to enhance your experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link to="/privacy" className="text-[#FF1493] hover:underline">
                  Learn more
                </Link>
              </p>

              {showDetails && (
                <div className="space-y-3 mb-4 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Essential Cookies</h4>
                    <p className="text-xs text-gray-400">
                      Required for the website to function. These include authentication, security, and core functionality.
                      Cannot be disabled.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Functional Cookies</h4>
                    <p className="text-xs text-gray-400">
                      Remember your preferences and settings to provide a personalized experience.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Analytics Cookies</h4>
                    <p className="text-xs text-gray-400">
                      Help us understand how visitors interact with our website through anonymized data collection.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={handleAcceptEssential}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {showDetails ? 'Hide Details' : 'Customize'}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close cookie banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
