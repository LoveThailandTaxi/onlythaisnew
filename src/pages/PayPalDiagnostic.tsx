import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function PayPalDiagnostic() {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const standardPlanId = import.meta.env.VITE_PAYPAL_STANDARD_PLAN_ID;
  const vipPlanId = import.meta.env.VITE_PAYPAL_VIP_PLAN_ID;

  const isSandboxClient = clientId?.startsWith('Aa') || clientId?.startsWith('Ab');
  const isProductionClient = clientId?.startsWith('A') && !clientId?.startsWith('Aa') && !clientId?.startsWith('Ab');

  const standardPlanType = standardPlanId?.startsWith('P-') && standardPlanId.length < 30 ? 'production' :
                           standardPlanId?.length > 30 ? 'sandbox' : 'unknown';
  const vipPlanType = vipPlanId?.startsWith('P-') && vipPlanId.length < 30 ? 'production' :
                      vipPlanId?.length > 30 ? 'sandbox' : 'unknown';

  const hasEnvironmentMismatch =
    (isSandboxClient && (standardPlanType === 'production' || vipPlanType === 'production')) ||
    (isProductionClient && (standardPlanType === 'sandbox' || vipPlanType === 'sandbox'));

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">PayPal Integration Diagnostic</h1>
          <p className="text-gray-400">Comprehensive analysis of your PayPal configuration</p>
        </div>

        <div className={`mb-8 p-6 rounded-xl border-2 ${
          hasEnvironmentMismatch
            ? 'bg-red-900/20 border-red-500'
            : 'bg-green-900/20 border-green-500'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {hasEnvironmentMismatch ? (
              <>
                <XCircle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-red-400">Configuration Error Detected</h2>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-green-400">Configuration Looks Good</h2>
              </>
            )}
          </div>
          {hasEnvironmentMismatch && (
            <p className="text-red-300">
              You're mixing sandbox and production credentials. This will prevent payments from working.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">PayPal Client ID</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {clientId ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-gray-300 font-mono text-sm break-all">{clientId || 'Not configured'}</p>
                  <p className={`text-sm mt-1 ${isSandboxClient ? 'text-yellow-400' : isProductionClient ? 'text-blue-400' : 'text-red-400'}`}>
                    {isSandboxClient && 'Type: Sandbox (Test Mode)'}
                    {isProductionClient && 'Type: Production (Live Mode)'}
                    {!isSandboxClient && !isProductionClient && 'Type: Unknown or Invalid'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription Plan IDs</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {standardPlanId ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">Standard Plan:</p>
                  <p className="text-gray-300 font-mono text-sm break-all">{standardPlanId || 'Not configured'}</p>
                  {standardPlanId && (
                    <p className={`text-sm mt-1 ${
                      standardPlanType === 'production' ? 'text-blue-400' :
                      standardPlanType === 'sandbox' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      Type: {standardPlanType === 'production' ? 'Production Plan' :
                             standardPlanType === 'sandbox' ? 'Sandbox Plan' :
                             'Unknown Format'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                {vipPlanId ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">VIP Plan:</p>
                  <p className="text-gray-300 font-mono text-sm break-all">{vipPlanId || 'Not configured'}</p>
                  {vipPlanId && (
                    <p className={`text-sm mt-1 ${
                      vipPlanType === 'production' ? 'text-blue-400' :
                      vipPlanType === 'sandbox' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      Type: {vipPlanType === 'production' ? 'Production Plan' :
                             vipPlanType === 'sandbox' ? 'Sandbox Plan' :
                             'Unknown Format'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {hasEnvironmentMismatch && (
            <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Environment Mismatch Detected</h3>
                  <p className="text-red-300 mb-4">
                    You cannot use sandbox Client ID with production Plan IDs (or vice versa). This will cause buttons to not work.
                  </p>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-lg p-4 mb-4">
                <h4 className="text-white font-semibold mb-2">Solution Option 1: Use Sandbox Mode</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://developer.paypal.com/dashboard/" target="_blank" className="text-blue-400 hover:underline">PayPal Developer Dashboard</a></li>
                  <li>Navigate to "Apps & Credentials" → Sandbox</li>
                  <li>Click on your sandbox app</li>
                  <li>Go to "Products" → "Subscriptions"</li>
                  <li>Create sandbox subscription plans (Standard $19, VIP $29)</li>
                  <li>Copy the sandbox plan IDs and update your .env file</li>
                </ol>
              </div>

              <div className="bg-[#0A0A0A] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Solution Option 2: Use Production Mode</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://www.paypal.com/businessmanage/credentials/apiAccess" target="_blank" className="text-blue-400 hover:underline">PayPal Business Dashboard</a></li>
                  <li>Get your production Client ID and Secret</li>
                  <li>Ensure your subscription plans are created in production</li>
                  <li>Update your .env file with production credentials</li>
                  <li>Configure Supabase edge function secrets</li>
                </ol>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Backend Configuration (Edge Functions)</h3>
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm mb-2">
                    The following environment variables need to be configured in Supabase:
                  </p>
                  <ul className="text-yellow-200 text-sm space-y-1 list-disc list-inside font-mono">
                    <li>PAYPAL_CLIENT_ID</li>
                    <li>PAYPAL_CLIENT_SECRET</li>
                    <li>PAYPAL_WEBHOOK_ID</li>
                  </ul>
                  <p className="text-yellow-300 text-sm mt-3">
                    Configure these using: <code className="bg-[#0A0A0A] px-2 py-1 rounded">supabase secrets set PAYPAL_CLIENT_ID=your_id</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Reference</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-gray-400 w-32">Sandbox Client:</span>
                <span className="text-gray-300 font-mono">Starts with Aa or Ab</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-32">Production Client:</span>
                <span className="text-gray-300 font-mono">Starts with A (not Aa/Ab)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-32">Production Plan:</span>
                <span className="text-gray-300 font-mono">Short format (P-XXXXXXXXXXXX)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-32">Sandbox Plan:</span>
                <span className="text-gray-300 font-mono">Longer format with more characters</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/subscribe"
            className="inline-block px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/90 transition-colors"
          >
            Back to Subscribe Page
          </a>
        </div>
      </div>
    </div>
  );
}
