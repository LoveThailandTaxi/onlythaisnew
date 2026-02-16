/*
  # Fix Media Public Access
  
  ## Overview
  Allow public (unauthenticated) users to view media images on the browse profiles page.
  
  ## Changes
  1. Add RLS policy for anonymous users to view media
  
  ## Security
  - Read-only access for public users
  - No modification permissions for unauthenticated users
*/

CREATE POLICY "Anyone including anonymous can view media"
  ON media
  FOR SELECT
  TO anon
  USING (true);
