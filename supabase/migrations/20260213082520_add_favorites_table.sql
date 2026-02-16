/*
  # Add Favorites Feature

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `consumer_id` (uuid, references auth.users)
      - `creator_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - Unique constraint on (consumer_id, creator_id) to prevent duplicates

  2. Security
    - Enable RLS on `favorites` table
    - Add policy for consumers to view their own favorites
    - Add policy for consumers to add their own favorites
    - Add policy for consumers to remove their own favorites

  3. Indexes
    - Index on consumer_id for fast lookups
    - Index on creator_id for analytics
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(consumer_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_consumer ON favorites(consumer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_creator ON favorites(creator_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can add own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can remove own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = consumer_id);