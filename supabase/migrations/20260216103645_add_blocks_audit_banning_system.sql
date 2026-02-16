/*
  # Complete Moderation System - Blocks, Audit Logs, and Banning

  1. New Tables
    - `blocks`
      - `id` (uuid, primary key)
      - `blocker_id` (uuid, references auth.users) - User who blocked
      - `blocked_id` (uuid, references profiles) - User who was blocked
      - `created_at` (timestamptz)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, references auth.users) - Admin who performed action
      - `action_type` (text) - Type of action (suspend_user, unsuspend_user, ban_email, ban_ip, resolve_report, delete_content)
      - `target_user_id` (uuid, references profiles) - User affected by action
      - `target_type` (text) - Type of target (user, report, content)
      - `target_id` (uuid) - ID of the target
      - `details` (jsonb) - Additional details about the action
      - `reason` (text) - Reason for the action
      - `created_at` (timestamptz)
    
    - `banned_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - User who was banned
      - `email` (text) - Email address banned
      - `ip_address` (text) - IP address banned
      - `reason` (text) - Reason for ban
      - `banned_by` (uuid, references auth.users) - Admin who issued ban
      - `banned_at` (timestamptz)
      - `expires_at` (timestamptz) - NULL for permanent bans
      - `is_active` (boolean) - Whether ban is currently active

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can block others
    - Users can only view their own blocks
    - Only admins can create audit logs
    - Only admins can view audit logs
    - Only admins can manage bans
*/

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others"
  ON blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their own blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Admins can view all blocks"
  ON blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('suspend_user', 'unsuspend_user', 'ban_email', 'ban_ip', 'unban_user', 'resolve_report', 'dismiss_report', 'delete_content', 'delete_message', 'view_messages')),
  target_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target_type text CHECK (target_type IN ('user', 'report', 'content', 'message', 'conversation')),
  target_id uuid,
  details jsonb,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Banned users table
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  email text,
  ip_address text,
  reason text NOT NULL,
  banned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  CONSTRAINT banned_users_check CHECK (user_id IS NOT NULL OR email IS NOT NULL OR ip_address IS NOT NULL)
);

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage bans"
  ON banned_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_banned_users_email ON banned_users(email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banned_users_ip ON banned_users(ip_address) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banned_users_is_active ON banned_users(is_active);

-- Helper function to check if a user/email/ip is banned
CREATE OR REPLACE FUNCTION is_banned(check_user_id uuid DEFAULT NULL, check_email text DEFAULT NULL, check_ip text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM banned_users
    WHERE is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      (check_user_id IS NOT NULL AND user_id = check_user_id) OR
      (check_email IS NOT NULL AND email = check_email) OR
      (check_ip IS NOT NULL AND ip_address = check_ip)
    )
  );
END;
$$;
