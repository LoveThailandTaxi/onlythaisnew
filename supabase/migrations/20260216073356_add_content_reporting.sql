/*
  # Content Reporting and Moderation System

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, references auth.users) - User who submitted the report
      - `reported_user_id` (uuid, references profiles) - User being reported
      - `reported_content_type` (text) - Type of content (profile, message, media)
      - `reported_content_id` (uuid) - ID of the content being reported
      - `reason` (text) - Category of the report
      - `description` (text) - Detailed description from reporter
      - `status` (text) - Status of the report (pending, reviewed, resolved, dismissed)
      - `reviewed_by` (uuid, references auth.users) - Admin who reviewed
      - `reviewed_at` (timestamptz) - When it was reviewed
      - `resolution_notes` (text) - Admin notes on resolution
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `reports` table
    - Users can create reports
    - Users can view their own reports
    - Admins can view and manage all reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reported_content_type text NOT NULL CHECK (reported_content_type IN ('profile', 'message', 'media')),
  reported_content_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('harassment', 'inappropriate_content', 'spam', 'fake_profile', 'underage', 'violence', 'hate_speech', 'scam', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
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

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
