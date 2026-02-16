/*
  # Add Video Support to Media Table

  1. Changes
    - Add `media_type` column to differentiate between images and videos
    - Add `video_url` column for video storage
    - Add `display_order` column for ordering media items
    - Add `duration` column for video duration tracking
    - Update RLS policies for media management

  2. Security
    - Update RLS policies to allow creators to manage their own media
    - Allow public read access for viewing profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE media ADD COLUMN media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE media ADD COLUMN video_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE media ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media' AND column_name = 'duration'
  ) THEN
    ALTER TABLE media ADD COLUMN duration numeric;
  END IF;
END $$;

DROP POLICY IF EXISTS "Creators can manage their own media" ON media;
DROP POLICY IF EXISTS "Anyone can view media" ON media;

CREATE POLICY "Creators can manage their own media"
  ON media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = media.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view media"
  ON media
  FOR SELECT
  TO authenticated
  USING (true);
