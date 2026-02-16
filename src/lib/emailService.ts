import { supabase } from './supabase';

interface EmailData {
  type: 'welcome' | 'creator_application' | 'subscription_confirmation' | 'message_notification' | 'email_verification';
  to: string;
  data: Record<string, string>;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No active session');
      return false;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(emailData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Email sending failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    type: 'welcome',
    to: email,
    data: { name },
  });
}

export async function sendCreatorApplicationEmail(email: string, name: string) {
  return sendEmail({
    type: 'creator_application',
    to: email,
    data: { name },
  });
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  tier: string,
  creatorName: string,
  creatorId: string
) {
  return sendEmail({
    type: 'subscription_confirmation',
    to: email,
    data: { name, tier, creatorName, creatorId },
  });
}

export async function sendMessageNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string
) {
  return sendEmail({
    type: 'message_notification',
    to: recipientEmail,
    data: { recipientName, senderName, messagePreview },
  });
}

export async function sendEmailVerification(
  email: string,
  name: string,
  token: string
) {
  return sendEmail({
    type: 'email_verification',
    to: email,
    data: { name, token },
  });
}
