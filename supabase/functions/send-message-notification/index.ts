import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "members@onlythais.club";
const SITE_URL = "https://www.onlythais.club";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { recipientId, senderId, messagePreview } = await req.json();

    if (!recipientId || !senderId || !messagePreview) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user: recipientUser } } = await supabaseClient.auth.admin.getUserById(recipientId);
    const { data: recipientProfile } = await supabaseClient
      .from("profiles")
      .select("display_name")
      .eq("user_id", recipientId)
      .maybeSingle();

    const { data: senderProfile } = await supabaseClient
      .from("profiles")
      .select("display_name")
      .eq("user_id", senderId)
      .maybeSingle();

    if (!recipientUser?.email) {
      return new Response(
        JSON.stringify({ error: "Recipient email not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const recipientName = recipientProfile?.display_name || "there";
    const senderName = senderProfile?.display_name || "Someone";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `OnlyThais <${FROM_EMAIL}>`,
        to: [recipientUser.email],
        subject: `New Message from ${senderName} - OnlyThais`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF1493;">You Have a New Message!</h1>
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> sent you a message on OnlyThais.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">${messagePreview}</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/messages" style="background-color: #FF1493; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Message</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${JSON.stringify(resendData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Message notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
