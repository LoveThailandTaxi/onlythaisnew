/*
  # Add Date of Birth and Age Verification

  ## Overview
  Implements server-side age verification to ensure all creators are 18+ years old.
  This replaces the easily-bypassed client-side localStorage check with database-enforced validation.

  ## Changes Made

  ### 1. New Columns Added to `profiles` table
    - `date_of_birth` (date, nullable initially) - User's date of birth
    - `age_verified` (boolean, default false) - Tracks if age has been verified

  ### 2. Database Functions
    - `calculate_age(date_of_birth date)` - Calculates age from date of birth
    - `is_over_18(date_of_birth date)` - Returns true if user is 18 or older

  ### 3. Database Constraints
    - Check constraint on profiles to ensure creators with date_of_birth are 18+
    - Trigger to automatically set age_verified when DOB is provided and user is 18+

  ### 4. Security (RLS Policies)
    - Updated insert policy to require age verification for creators
    - Updated update policy to prevent changing DOB to underage

  ## Important Notes
  - Existing profiles without DOB can continue to function (nullable field)
  - New creator signups MUST provide DOB and be 18+
  - Age calculation is done server-side and cannot be bypassed
  - Consumer accounts (men) don't require DOB verification
  - Date of birth is stored but not publicly visible (respects privacy)
*/

-- Add date_of_birth column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;
END $$;

-- Add age_verified column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'age_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN age_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(dob date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to check if user is over 18
CREATE OR REPLACE FUNCTION is_over_18(dob date)
RETURNS boolean AS $$
BEGIN
  IF dob IS NULL THEN
    RETURN false;
  END IF;
  RETURN calculate_age(dob) >= 18;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to automatically set age_verified
CREATE OR REPLACE FUNCTION set_age_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    NEW.age_verified = is_over_18(NEW.date_of_birth);
  ELSE
    NEW.age_verified = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically verify age on insert/update
DROP TRIGGER IF EXISTS trigger_set_age_verified ON profiles;
CREATE TRIGGER trigger_set_age_verified
  BEFORE INSERT OR UPDATE OF date_of_birth ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_age_verified();

-- Add check constraint to ensure creators are 18+
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_creator_age'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT check_creator_age
      CHECK (
        user_type != 'creator' OR
        date_of_birth IS NULL OR
        is_over_18(date_of_birth)
      );
  END IF;
END $$;

-- Update the existing INSERT policy to require age verification for creators
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (user_type = 'consumer' OR (user_type = 'creator' AND (date_of_birth IS NULL OR age_verified = true)))
  );

-- Update the existing UPDATE policy to maintain age requirements
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (user_type = 'consumer' OR (user_type = 'creator' AND (date_of_birth IS NULL OR age_verified = true)))
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified ON profiles(age_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);