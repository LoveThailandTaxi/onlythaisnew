import { supabase } from './supabase';

export interface MessageUsage {
  id: string;
  user_id: string;
  month_year: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMessageUsage = async (userId: string): Promise<MessageUsage | null> => {
  const monthYear = getCurrentMonthYear();

  const { data, error } = await supabase
    .from('message_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .maybeSingle();

  if (error) {
    console.error('Error fetching message usage:', error);
    return null;
  }

  return data;
};

export const canSendMessage = async (
  userId: string,
  receiverId: string,
  tier: 'none' | 'standard' | 'vip'
): Promise<{ canSend: boolean; reason?: string; remaining?: number }> => {
  if (tier === 'vip') {
    return { canSend: true };
  }

  if (tier === 'none') {
    return { canSend: false, reason: 'You need an active subscription to send messages.' };
  }

  const hasExistingConversation = await checkExistingConversation(userId, receiverId);
  if (hasExistingConversation) {
    return { canSend: true };
  }

  const usage = await getMessageUsage(userId);
  const currentCount = usage?.message_count || 0;
  const limit = 30;

  if (currentCount >= limit) {
    return {
      canSend: false,
      reason: `You've reached your monthly limit of ${limit} initial contact messages. Upgrade to VIP for unlimited messaging.`,
      remaining: 0,
    };
  }

  return {
    canSend: true,
    remaining: limit - currentCount,
  };
};

export const checkExistingConversation = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking existing conversation:', error);
    return false;
  }

  return !!data;
};

export const incrementMessageCount = async (userId: string): Promise<boolean> => {
  const monthYear = getCurrentMonthYear();

  const usage = await getMessageUsage(userId);

  if (usage) {
    const { error } = await supabase
      .from('message_usage')
      .update({ message_count: usage.message_count + 1 })
      .eq('id', usage.id);

    if (error) {
      console.error('Error updating message count:', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('message_usage')
      .insert({
        user_id: userId,
        month_year: monthYear,
        message_count: 1,
      });

    if (error) {
      console.error('Error creating message usage:', error);
      return false;
    }
  }

  return true;
};
