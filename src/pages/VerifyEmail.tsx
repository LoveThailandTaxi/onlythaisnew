import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('verify_email', {
        verification_token: token,
      });

      if (error) throw error;

      if (data) {
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now enjoy all features.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Invalid or expired verification link. Please request a new verification email.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Failed to verify email. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FF1493] mb-2">Only Thais</h1>
          <p className="text-gray-400">Email Verification</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader className="w-16 h-16 text-[#FF1493] animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h2>
                <p className="text-gray-400">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
                <p className="text-gray-300 mb-6">{message}</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
