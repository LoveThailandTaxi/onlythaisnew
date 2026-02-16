/*
  # Email Verification System

  1. New Tables
    - `email_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - User who needs to verify
      - `email` (text) - Email address to verify
      - `token` (text) - Verification token
      - `verified` (boolean) - Whether email is verified
      - `verified_at` (timestamptz) - When email was verified
      - `expires_at` (timestamptz) - When token expires
      - `created_at` (timestamptz)

  2. Updates to Profiles
    - Add `email_verified` (boolean) - Whether user's email is verified
    - Add `email_verified_at` (timestamptz) - When email was verified

  3. Security
    - Enable RLS on `email_verifications` table
    - Users can view their own verification status
    - Only system can create and update verifications
*/

-- Add email verification columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified_at timestamptz;
  END IF;
END $$;

-- Create email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verifications"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token) WHERE verified = false;
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at) WHERE verified = false;

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_email(verification_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  -- Find the verification
  SELECT user_id, email INTO v_user_id, v_email
  FROM email_verifications
  WHERE token = verification_token
    AND verified = false
    AND expires_at > now();

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Mark verification as complete
  UPDATE email_verifications
  SET verified = true,
      verified_at = now()
  WHERE token = verification_token;

  -- Update profile
  UPDATE profiles
  SET email_verified = true,
      email_verified_at = now()
  WHERE user_id = v_user_id;

  RETURN true;
END;
$$;
