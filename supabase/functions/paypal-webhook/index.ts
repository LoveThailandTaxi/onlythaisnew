import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "support@onlythais.club";

async function sendSubscriptionEmail(
  email: string,
  name: string,
  tier: string
) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `OnlyThais <${FROM_EMAIL}>`,
        to: [email],
        subject: `Subscription Confirmed - OnlyThais`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF1493;">Subscription Confirmed!</h1>
            <p>Hi ${name},</p>
            <p>Your <strong>${tier.toUpperCase()}</strong> subscription to OnlyThais is now active!</p>
            <p><strong>Subscription Details:</strong></p>
            <ul>
              <li>Tier: ${tier.toUpperCase()}</li>
              <li>Billing: Monthly</li>
              <li>Access: ${tier === 'vip' ? 'Unlimited messages and exclusive VIP features' : 'Browse profiles and connect with creators'}</li>
            </ul>
            <p style="margin-top: 30px;">
              <a href="https://www.onlythais.club/browse" style="background-color: #FF1493; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Browsing</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to send email:", error);
    }
  } catch (error) {
    console.error("Error sending subscription email:", error);
  }
}

async function verifyPayPalWebhook(
  webhookId: string,
  headers: Headers,
  body: string
): Promise<boolean> {
  const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const isProduction = Deno.env.get("PAYPAL_MODE") === "production";

  if (!paypalClientId || !paypalClientSecret) {
    console.error("PayPal credentials not configured");
    return false;
  }

  const baseUrl = isProduction
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = btoa(`${paypalClientId}:${paypalClientSecret}`);
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    console.error("Failed to get PayPal access token:", await tokenResponse.text());
    return false;
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const verifyResponse = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_time: headers.get("paypal-transmission-time"),
        cert_url: headers.get("paypal-cert-url"),
        auth_algo: headers.get("paypal-auth-algo"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  );

  if (!verifyResponse.ok) {
    console.error("Failed to verify webhook signature:", await verifyResponse.text());
    return false;
  }

  const verifyData = await verifyResponse.json();
  return verifyData.verification_status === "SUCCESS";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    const paypalMode = Deno.env.get("PAYPAL_MODE") || "sandbox";

    console.log("PayPal webhook received - Mode:", paypalMode);

    if (!webhookId) {
      console.error("PAYPAL_WEBHOOK_ID not configured");
      return new Response(
        JSON.stringify({ error: "PayPal webhook not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    console.log("Webhook event received:", JSON.parse(body).event_type);

    const isValid = await verifyPayPalWebhook(webhookId, req.headers, body);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event = JSON.parse(body);

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subscription = event.resource;
        const userId = subscription.custom_id;

        if (userId) {
          const tier = subscription.plan_id.includes("standard") ? "standard" : "vip";

          await supabaseClient
            .from("subscriptions")
            .update({
              tier,
              status: "active",
              paypal_subscription_id: subscription.id,
              expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("user_id", userId);

          const { data: { user } } = await supabaseClient.auth.admin.getUserById(userId);
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("display_name")
            .eq("user_id", userId)
            .maybeSingle();

          if (user?.email && event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
            await sendSubscriptionEmail(
              user.email,
              profile?.display_name || "there",
              tier
            );
          }
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const sale = event.resource;
        const customId = sale.custom_id || sale.custom;

        if (customId && customId.includes("|")) {
          const [userId, tier] = customId.split("|");

          await supabaseClient
            .from("subscriptions")
            .update({
              tier,
              status: "active",
              paypal_order_id: sale.id,
              expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.UPDATED": {
        const subscription = event.resource;

        await supabaseClient
          .from("subscriptions")
          .update({
            status: subscription.status === "ACTIVE" ? "active" : "canceled",
          })
          .eq("paypal_subscription_id", subscription.id);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscription = event.resource;

        await supabaseClient
          .from("subscriptions")
          .update({
            status: "expired",
            tier: "none",
          })
          .eq("paypal_subscription_id", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
