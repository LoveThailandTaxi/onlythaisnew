/*
  # Fix Profiles Public Access
  
  ## Overview
  Allow public (unauthenticated) users to view creator profiles on the browse profiles page.
  
  ## Changes
  1. Add RLS policy for anonymous users to view creator profiles
  
  ## Security
  - Read-only access for public users
  - Only creator profiles are visible to anonymous users
  - No modification permissions for unauthenticated users
*/

CREATE POLICY "Anonymous users can view creator profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (user_type = 'creator');
