import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  tier: 'standard' | 'vip';
  userId: string;
}

async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal is not configured. Please set up your PayPal client ID and secret.');
    }

    const { tier, userId }: CheckoutRequest = await req.json();

    if (!tier || !userId) {
      throw new Error('Missing required fields: tier and userId');
    }

    const plans = {
      standard: {
        name: 'OnlyThais Standard Membership',
        description: 'Monthly standard membership with access to all profiles',
        amount: '19.00',
        planId: Deno.env.get('PAYPAL_STANDARD_PLAN_ID'),
      },
      vip: {
        name: 'OnlyThais VIP Membership',
        description: 'Monthly VIP membership with unlimited messaging and exclusive features',
        amount: '29.00',
        planId: Deno.env.get('PAYPAL_VIP_PLAN_ID'),
      },
    };

    const selectedPlan = plans[tier];
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';

    const accessToken = await getPayPalAccessToken(paypalClientId, paypalClientSecret);

    if (selectedPlan.planId) {
      const subscriptionResponse = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: selectedPlan.planId,
          application_context: {
            brand_name: 'OnlyThais',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${baseUrl}/dashboard`,
            cancel_url: `${baseUrl}/subscribe`,
          },
          custom_id: userId,
        }),
      });

      if (!subscriptionResponse.ok) {
        const error = await subscriptionResponse.text();
        throw new Error(`PayPal API error: ${error}`);
      }

      const subscription = await subscriptionResponse.json();
      const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve')?.href;

      return new Response(
        JSON.stringify({
          url: approvalUrl,
          subscriptionId: subscription.id,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    } else {
      const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: userId,
            description: selectedPlan.description,
            custom_id: `${userId}|${tier}`,
            amount: {
              currency_code: 'USD',
              value: selectedPlan.amount,
            },
          }],
          application_context: {
            brand_name: 'OnlyThais',
            locale: 'en-US',
            landing_page: 'NO_PREFERENCE',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${baseUrl}/dashboard`,
            cancel_url: `${baseUrl}/subscribe`,
          },
        }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.text();
        throw new Error(`PayPal API error: ${error}`);
      }

      const order = await orderResponse.json();
      const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

      return new Response(
        JSON.stringify({
          url: approvalUrl,
          orderId: order.id,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session',
        details: 'Please ensure PayPal is properly configured with your client ID and secret.'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
