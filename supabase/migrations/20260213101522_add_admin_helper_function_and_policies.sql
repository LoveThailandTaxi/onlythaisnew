/*
  # Add Admin Helper Function and Safe Admin Policies

  ## Overview
  Creates a helper function to check admin status without causing recursion,
  then uses it to create safe admin policies for profile management.

  ## Changes
  1. Create `is_admin()` function with SECURITY DEFINER
     - Bypasses RLS to check admin status
     - Returns boolean indicating if current user is admin
  
  2. Add admin policies using the helper function
     - Admins can update any profile
     - Admins can delete any profile
     - No recursion issues since function has SECURITY DEFINER

  ## Security
  - Function is SECURITY DEFINER so it runs with elevated privileges
  - Only checks admin status, doesn't expose sensitive data
  - Policies use function result to grant admin permissions
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());
