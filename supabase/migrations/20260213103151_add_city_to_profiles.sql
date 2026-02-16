/*
  # Add City Field to Profiles

  1. New Columns
    - `city` (text, nullable) - The city where the creator is located
  
  2. Indexes
    - Add index on `city` column for efficient search queries
  
  3. Notes
    - This field enables location-based search functionality
    - Nullable to support existing profiles
    - Index improves query performance when filtering by city
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
END $$;

-- Create index for efficient city-based searches
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);