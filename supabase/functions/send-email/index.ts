import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "support@onlythais.club";
const SITE_URL = "https://www.onlythais.club";

interface EmailRequest {
  type: "welcome" | "creator_application" | "subscription_confirmation" | "message_notification" | "contact_form" | "email_verification";
  to: string;
  data: Record<string, string>;
}

function getEmailTemplate(type: string, data: Record<string, string>) {
  switch (type) {
    case "welcome":
      return {
        subject: "Welcome to OnlyThais! 🇹🇭",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to OnlyThais!</h1>
            <p>Hi ${data.name || "there"},</p>
            <p>Thank you for joining OnlyThais, the premier platform to connect with Thai creators.</p>
            <p>Start exploring amazing profiles and connect with creators today!</p>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/browse" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Browse Profiles</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      };

    case "creator_application":
      return {
        subject: "Creator Application Submitted - OnlyThais",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Creator Application Received!</h1>
            <p>Hi ${data.name || "there"},</p>
            <p>We've received your application to become a creator on OnlyThais. Our team will review your profile shortly.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team reviews your application (typically within 24-48 hours)</li>
              <li>You'll receive an email notification once approved</li>
              <li>Once approved, you can start posting content and earning</li>
            </ul>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      };

    case "subscription_confirmation":
      return {
        subject: `Subscription Confirmed - ${data.creatorName} - OnlyThais`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Subscription Confirmed!</h1>
            <p>Hi ${data.name || "there"},</p>
            <p>Your ${data.tier} subscription to <strong>${data.creatorName}</strong> is now active!</p>
            <p><strong>Subscription Details:</strong></p>
            <ul>
              <li>Tier: ${data.tier}</li>
              <li>Billing: Monthly</li>
              <li>Access: Unlimited messages and exclusive content</li>
            </ul>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/profile/${data.creatorId}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Visit Profile</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      };

    case "message_notification":
      return {
        subject: `New Message from ${data.senderName} - OnlyThais`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">You Have a New Message!</h1>
            <p>Hi ${data.recipientName || "there"},</p>
            <p><strong>${data.senderName}</strong> sent you a message on OnlyThais.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">${data.messagePreview}</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/messages" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Message</a>
            </p>
            <p style="margin-top: 40px; color: #666; font-size: 14px;">
              Questions? Contact us at ${FROM_EMAIL}
            </p>
          </div>
        `,
      };

    case "contact_form":
      return {
        subject: `Contact Form: ${data.subject} - OnlyThais`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">New Contact Form Submission</h1>
            <p><strong>From:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${data.message}</p>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              This message was sent from the OnlyThais contact form.
            </p>
          </div>
        `,
      };

    case "email_verification":
      return {
        subject: "Verify Your Email - OnlyThais",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF1493;">Verify Your Email Address</h1>
            <p>Hi ${data.name || "there"},</p>
            <p>Thank you for signing up with OnlyThais! To complete your registration and ensure the security of your account, please verify your email address.</p>
            <p style="margin-top: 30px;">
              <a href="${SITE_URL}/verify-email?token=${data.token}" style="background-color: #FF1493; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a>
            </p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${SITE_URL}/verify-email?token=${data.token}
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
          </div>
        `,
      };

    default:
      return {
        subject: "OnlyThais Notification",
        html: "<p>You have a new notification from OnlyThais.</p>",
      };
  }
}

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

    const { type, to, data }: EmailRequest = await req.json();

    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, to" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const template = getEmailTemplate(type, data);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `OnlyThais <${FROM_EMAIL}>`,
        to: [to],
        subject: template.subject,
        html: template.html,
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
