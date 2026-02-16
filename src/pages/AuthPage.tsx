import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const initialUserType = searchParams.get('type') === 'creator' ? 'creator' : 'consumer';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'consumer' | 'creator'>(initialUserType);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        if (userType === 'creator') {
          if (!dateOfBirth) {
            setError('Date of birth is required for creators');
            setLoading(false);
            return;
          }

          if (!ageConfirmed) {
            setError('You must confirm you are 18 years or older');
            setLoading(false);
            return;
          }

          const birthDate = new Date(dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

          if (actualAge < 18) {
            setError('You must be at least 18 years old to create a creator account');
            setLoading(false);
            return;
          }
        }

        await signUp(email, password, userType, dateOfBirth || undefined);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FF1493] mb-2">Only Thais</h1>
          <p className="text-gray-400">Premium connections await</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-4 text-lg font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 pb-4 text-lg font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    I am a:
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as 'consumer' | 'creator')}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                  >
                    <option value="consumer">Man (Looking for Women)</option>
                    <option value="creator">Woman (Looking to meet new contacts)</option>
                  </select>
                </div>

                {userType === 'creator' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date of Birth <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">You must be 18 or older to create a creator account</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="ageConfirm"
                        checked={ageConfirmed}
                        onChange={(e) => setAgeConfirmed(e.target.checked)}
                        required
                        className="w-5 h-5 mt-0.5 bg-[#0A0A0A] border-2 border-gray-800 rounded focus:ring-2 focus:ring-[#FF1493] text-[#FF1493]"
                      />
                      <label htmlFor="ageConfirm" className="text-sm text-gray-300 leading-tight">
                        I confirm that I am 18 years of age or older and agree to provide my date of birth for age verification purposes <span className="text-red-400">*</span>
                      </label>
                    </div>
                  </>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Continue to Subscription'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
