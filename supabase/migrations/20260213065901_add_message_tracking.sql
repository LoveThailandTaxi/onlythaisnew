/*
  # Message Tracking and Usage System

  ## Overview
  Adds message tracking and usage limits for subscription tiers.

  ## New Tables
  
  ### `message_usage`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - The consumer sending messages
  - `month_year` (text) - Format: "2026-02" for tracking monthly usage
  - `message_count` (integer) - Number of initial messages sent this month
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Modified Tables
  
  ### `profiles`
  - `is_new_creator` (boolean) - Marks creators as new for 7 days (VIP early access)

  ## Security
  - Enable RLS on message_usage table
  - Users can only read/update their own usage data
  
  ## Important Notes
  - Standard tier: 30 initial messages per month
  - VIP tier: Unlimited messages
  - Tracks initial contact messages only (first message to a creator)
*/

-- Add is_new_creator field to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_new_creator'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_new_creator boolean DEFAULT true;
  END IF;
END $$;

-- Create message_usage table
CREATE TABLE IF NOT EXISTS message_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable Row Level Security
ALTER TABLE message_usage ENABLE ROW LEVEL SECURITY;

-- Message usage policies
CREATE POLICY "Users can view their own message usage"
  ON message_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message usage"
  ON message_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message usage"
  ON message_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_message_usage_user_month ON message_usage(user_id, month_year);

-- Create trigger for updated_at
CREATE TRIGGER update_message_usage_updated_at BEFORE UPDATE ON message_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark creators as not new after 7 days
CREATE OR REPLACE FUNCTION mark_old_creators()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET is_new_creator = false
  WHERE is_new_creator = true
  AND user_type = 'creator'
  AND created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;
