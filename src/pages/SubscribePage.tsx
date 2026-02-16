import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Crown, CreditCard } from 'lucide-react';

export default function SubscribePage() {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'vip' | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    {
      id: 'standard',
      name: 'Standard',
      price: 19,
      planId: import.meta.env.VITE_PAYPAL_STANDARD_PLAN_ID,
      subscribeUrl: `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${import.meta.env.VITE_PAYPAL_STANDARD_PLAN_ID}`,
      features: [
        'Browse all profiles and view full profile details',
        'Contact up to 30 new creators per month',
        'Unlimited back-and-forth chat once contact is made',
        'Weekly newsletter with updated profiles',
        'Basic search functionality',
      ],
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 29,
      planId: import.meta.env.VITE_PAYPAL_VIP_PLAN_ID,
      subscribeUrl: `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${import.meta.env.VITE_PAYPAL_VIP_PLAN_ID}`,
      features: [
        'Browse all profiles and view full profile details',
        'Contact unlimited new creators every month',
        'Unlimited messaging with all creators',
        'VIP Profile Status badge',
        'Early access: new creators appear first with "New!" badge',
        'Weekly newsletter updates of new profiles',
        'Profile verification badge',
        'Priority customer support',
        'Advanced search filters and early feature updates',
      ],
    },
  ];

  const handleSubscribe = (subscribeUrl: string) => {
    window.open(subscribeUrl, '_blank', 'noopener,noreferrer');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Sign in to Subscribe</h1>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Tier to Unlock Access
          </h1>
          <p className="text-xl text-gray-400">
            Premium connections require a premium membership
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id as 'standard' | 'vip')}
              className={`bg-gray-900 rounded-2xl p-8 border-2 cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? 'border-[#FF1493] shadow-[0_0_30px_rgba(255,20,147,0.3)]'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {tier.id === 'vip' && <Crown className="w-8 h-8 text-[#FF1493]" />}
                <h2 className="text-3xl font-bold text-white">{tier.name}</h2>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-[#FF1493]">${tier.price}</span>
                <span className="text-gray-400 text-xl">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#FF1493] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.planId ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(tier.subscribeUrl);
                  }}
                  className="w-full py-4 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/90 transition-all transform hover:scale-105 font-semibold"
                >
                  Subscribe with PayPal
                </button>
              ) : (
                <div className="w-full py-4 bg-gray-800 text-gray-400 rounded-lg text-center text-sm">
                  {tier.name} plan not yet configured
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[#FF1493]" />
            <h3 className="text-xl font-semibold text-white">Secure Payment Processing</h3>
          </div>
          <p className="text-gray-400 mb-4">
            All payments are processed securely through PayPal. Your payment information is encrypted and never stored on our servers.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You can cancel your subscription at any time from your PayPal account. No refunds for partial months.
          </p>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <p className="text-sm font-semibold text-blue-400 mb-2">After Subscribing:</p>
            <ul className="text-xs text-blue-300 space-y-1 list-disc list-inside">
              <li>You'll be redirected to PayPal to complete your subscription</li>
              <li>After completing payment, return to your dashboard to access all features</li>
              <li>Your subscription will be activated within a few minutes</li>
              <li>Contact support if you don't see your subscription after 10 minutes</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400">
              Need help? Visit our <a href="/faq" className="text-[#FF1493] hover:underline">FAQ</a> or <a href="/contact" className="text-[#FF1493] hover:underline">contact support</a>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 mx-auto block text-gray-400 hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
