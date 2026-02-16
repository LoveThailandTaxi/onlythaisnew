import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "support@onlythais.club";
const SITE_URL = "https://www.onlythais.club";
const TEST_EMAIL = "cjhcentral@outlook.com";

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

    const testToken = crypto.randomUUID();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF1493;">Verify Your Email Address</h1>
        <p>Hi there,</p>
        <p>Thank you for signing up with OnlyThais! To complete your registration and ensure the security of your account, please verify your email address.</p>
        <p style="margin-top: 30px;">
          <a href="${SITE_URL}/verify-email?token=${testToken}" style="background-color: #FF1493; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${SITE_URL}/verify-email?token=${testToken}
        </p>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          This link will expire in 24 hours for security reasons.
        </p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you didn't create an account with OnlyThais, you can safely ignore this email.
        </p>
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Questions? Contact us at ${FROM_EMAIL}
        </p>
        <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          This is a test email sent to verify the email delivery system is working correctly.
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `OnlyThais <${FROM_EMAIL}>`,
        to: [TEST_EMAIL],
        subject: "Test: Verify Your Email - OnlyThais",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${JSON.stringify(resendData)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: `Test email sent successfully to ${TEST_EMAIL}`,
        testToken: testToken
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
