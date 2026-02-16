/*
  # Fix Infinite Recursion in Admin RLS Policies

  ## Problem
  The admin RLS policies were causing infinite recursion by querying the profiles table
  within the profiles table's own RLS policies. This created a circular reference that
  prevented ALL users from accessing their profiles.

  ## Solution
  1. Drop the problematic recursive admin policies
  2. Keep the basic "Anyone can view all profiles" policy for authenticated users
  3. Rely on application-level checks for admin operations (already implemented in AdminDashboard)

  ## Changes
  - Remove recursive admin SELECT policy
  - Remove recursive admin UPDATE policy  
  - Remove recursive admin DELETE policy
  - Keep existing non-recursive policies that work correctly

  ## Security Notes
  - Admins are still protected at the application level (AdminDashboard checks profile.role)
  - Users can only update their own profiles (existing policy)
  - Users can only insert their own profiles (existing policy)
  - All authenticated users can view profiles (needed for browsing functionality)
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
