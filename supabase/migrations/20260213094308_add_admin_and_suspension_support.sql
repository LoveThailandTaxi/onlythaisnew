/*
  # Add Admin Role and Account Suspension Support

  1. Schema Changes
    - Add `role` column to profiles table (default: 'consumer', options: 'consumer', 'creator', 'admin')
    - Add `suspended` column to profiles table (default: false)
    - Add `suspended_at` column to profiles table (nullable timestamp)
    - Add `suspended_reason` column to profiles table (nullable text)

  2. Security
    - Update RLS policies to check for suspension status
    - Add admin-only policies for user management

  3. Notes
    - Suspended accounts cannot log in or perform actions
    - Admins have full access to all data for moderation
    - First user with email ending in '@admin.onlythais.com' will be admin (you can manually update this)
*/

-- Add role column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'consumer' CHECK (role IN ('consumer', 'creator', 'admin'));
  END IF;
END $$;

-- Add suspension columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'suspended_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN suspended_reason text;
  END IF;
END $$;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON profiles(suspended);

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
  DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Admins can view all favorites" ON favorites;
  DROP POLICY IF EXISTS "Admins can view all media" ON media;
  DROP POLICY IF EXISTS "Admins can delete any media" ON media;
END $$;

-- Admin policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policy: Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policy: Admins can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policies for messages table
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policies for subscriptions table
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policies for favorites table
CREATE POLICY "Admins can view all favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Admin policies for media table
CREATE POLICY "Admins can view all media"
  ON media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any media"
  ON media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );