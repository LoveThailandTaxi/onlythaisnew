/*
  # Create Avatars Storage Bucket

  1. New Storage Bucket
    - Creates 'avatars' bucket for user profile images
    - Public bucket so avatars can be viewed without authentication

  2. Storage Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to update their own avatars
    - Allow public read access to all avatars
    - Allow authenticated users to delete their own avatars

  3. Notes
    - File path structure: {user_id}/avatar.{ext}
    - Maximum file size handled by Supabase default settings
    - Supports image formats: jpg, jpeg, png, gif, webp
*/

-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
