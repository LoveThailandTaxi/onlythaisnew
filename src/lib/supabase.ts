import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          user_type: 'consumer' | 'creator';
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          category: 'dating' | 'content_creator' | 'escort' | 'ladyboy' | 'massage' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_type: 'consumer' | 'creator';
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          category?: 'dating' | 'content_creator' | 'escort' | 'ladyboy' | 'massage' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_type?: 'consumer' | 'creator';
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          category?: 'dating' | 'content_creator' | 'escort' | 'ladyboy' | 'massage' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'none' | 'standard' | 'vip';
          status: 'active' | 'canceled' | 'expired';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'none' | 'standard' | 'vip';
          status?: 'active' | 'canceled' | 'expired';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'none' | 'standard' | 'vip';
          status?: 'active' | 'canceled' | 'expired';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          expiry_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          profile_id: string;
          image_url: string;
          is_primary: boolean;
          created_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_status: boolean;
          created_at: string;
        };
      };
    };
  };
};
