/*
  # Add Creator Profile Details

  1. New Columns
    - `height` (text) - Creator's height (e.g., "165 cm", "5'5\"")
    - `build` (text) - Body build type: Slim, Medium, or Curvy
    - `hair_colour` (text) - Hair color
    - `eye_colour` (text) - Eye color
    - `smoke` (boolean) - Whether the creator smokes

  2. Notes
    - All fields are optional (nullable) as existing profiles need to continue working
    - These fields are primarily for creator profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'height'
  ) THEN
    ALTER TABLE profiles ADD COLUMN height text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'build'
  ) THEN
    ALTER TABLE profiles ADD COLUMN build text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hair_colour'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hair_colour text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'eye_colour'
  ) THEN
    ALTER TABLE profiles ADD COLUMN eye_colour text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'smoke'
  ) THEN
    ALTER TABLE profiles ADD COLUMN smoke boolean;
  END IF;
END $$;