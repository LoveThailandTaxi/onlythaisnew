/*
  # Make Media image_url Nullable for Video Support

  ## Problem
  The `image_url` column in the media table is NOT NULL, but video uploads only
  populate the `video_url` column. This causes video uploads to fail with a
  constraint violation.

  ## Solution
  Make the `image_url` column nullable so that:
  - Image media items can have an image_url (and null video_url)
  - Video media items can have a video_url (and null image_url)

  ## Changes
  - Alter media.image_url to allow NULL values
  
  ## Security
  - No changes to RLS policies
  - Maintains existing access controls
*/

ALTER TABLE media 
ALTER COLUMN image_url DROP NOT NULL;
