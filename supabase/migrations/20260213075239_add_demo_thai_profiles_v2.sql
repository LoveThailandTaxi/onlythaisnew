/*
  # Add Demo Thai Women Profiles

  ## Overview
  This migration creates 10 demo profiles of Thai women for the dating platform,
  complete with user accounts, profile information, and images.

  ## Changes
  1. Creates 10 demo user accounts in auth.users
  2. Creates corresponding profiles with bios and details
  3. Adds profile images from stock photos

  ## Demo Profiles Created
  Each profile includes:
  - Unique email and user account
  - Display name and bio
  - Category set to 'dating'
  - Profile images

  ## Security Notes
  - These are demo accounts for platform showcase
  - All profiles are creator type
*/

-- Insert demo users into auth.users and create their profiles
DO $$
DECLARE
  user_id_1 uuid := gen_random_uuid();
  user_id_2 uuid := gen_random_uuid();
  user_id_3 uuid := gen_random_uuid();
  user_id_4 uuid := gen_random_uuid();
  user_id_5 uuid := gen_random_uuid();
  user_id_6 uuid := gen_random_uuid();
  user_id_7 uuid := gen_random_uuid();
  user_id_8 uuid := gen_random_uuid();
  user_id_9 uuid := gen_random_uuid();
  user_id_10 uuid := gen_random_uuid();
  profile_id_1 uuid;
  profile_id_2 uuid;
  profile_id_3 uuid;
  profile_id_4 uuid;
  profile_id_5 uuid;
  profile_id_6 uuid;
  profile_id_7 uuid;
  profile_id_8 uuid;
  profile_id_9 uuid;
  profile_id_10 uuid;
BEGIN
  -- Insert demo users into auth.users (skip if emails already exist)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.nong@onlythais.com') THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES
      (user_id_1, '00000000-0000-0000-0000-000000000000', 'demo.nong@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_2, '00000000-0000-0000-0000-000000000000', 'demo.ploy@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_3, '00000000-0000-0000-0000-000000000000', 'demo.mint@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_4, '00000000-0000-0000-0000-000000000000', 'demo.nam@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_5, '00000000-0000-0000-0000-000000000000', 'demo.fah@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_6, '00000000-0000-0000-0000-000000000000', 'demo.pim@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_7, '00000000-0000-0000-0000-000000000000', 'demo.bow@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_8, '00000000-0000-0000-0000-000000000000', 'demo.joy@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_9, '00000000-0000-0000-0000-000000000000', 'demo.cream@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', ''),
      (user_id_10, '00000000-0000-0000-0000-000000000000', 'demo.air@onlythais.com', crypt('demo123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated', '', '', '', '');

    -- Insert profiles
    INSERT INTO profiles (id, user_id, user_type, display_name, bio, category, created_at, updated_at)
    VALUES
      (gen_random_uuid(), user_id_1, 'creator', 'Nong', 'Hi! I''m Nong, 25 years old from Bangkok. I love cooking Thai food, traveling to beaches, and meeting new people. Looking for someone genuine and kind to share good times with. I enjoy movies, trying new restaurants, and quiet evenings. Let''s chat and see where it goes!', 'dating', now(), now()),
      (gen_random_uuid(), user_id_2, 'creator', 'Ploy', 'Sawadee ka! I''m Ploy, 23, living in Chiang Mai. I work as a massage therapist and love helping people relax. In my free time, I enjoy yoga, reading, and exploring nature. I''m looking for a respectful man who appreciates Thai culture and wants meaningful conversation.', 'dating', now(), now()),
      (gen_random_uuid(), user_id_3, 'creator', 'Mint', 'Hello! I''m Mint, 27, from Pattaya. I''m a happy and positive person who loves dancing, singing karaoke, and spending time with friends. I''m looking for someone fun and adventurous who wants to explore Thailand together. I speak good English and love meeting foreigners!', 'dating', now(), now()),
      (gen_random_uuid(), user_id_4, 'creator', 'Nam', 'Hi there! I''m Nam, 24 years old from Phuket. I work in hospitality and love meeting people from around the world. I enjoy beach walks, sunset watching, and Thai boxing. Looking for someone honest and caring who wants to build a real connection.', 'dating', now(), now()),
      (gen_random_uuid(), user_id_5, 'creator', 'Fah', 'Sawadee! I''m Fah, 26, from Bangkok. I''m a university graduate working in marketing. I love art, photography, and café hopping. I''m looking for an intelligent, kind man who values good conversation and wants to experience Thai culture authentically.', 'dating', now(), now()),
      (gen_random_uuid(), user_id_6, 'creator', 'Pim', 'Hello! I''m Pim, 22, from Koh Samui. I''m a cheerful person who loves the beach, water sports, and island life. I work at a resort and meet tourists every day. Looking for someone who loves adventure and wants to enjoy life together. Let''s talk!', 'dating', now(), now()),
      (gen_random_uuid(), user_id_7, 'creator', 'Bow', 'Hi! I''m Bow, 28, living in Bangkok. I''m a professional dancer and fitness enthusiast. I love staying active, trying new foods, and traveling. I''m looking for a confident, mature man who knows what he wants and treats women with respect.', 'dating', now(), now()),
      (gen_random_uuid(), user_id_8, 'creator', 'Joy', 'Sawadee ka! I''m Joy, 25, from Chiang Rai. I''m a sweet and caring person who loves cooking, gardening, and traditional Thai crafts. Looking for a kind-hearted man who wants a loyal partner. I value honesty and family. Let''s get to know each other!', 'dating', now(), now()),
      (gen_random_uuid(), user_id_9, 'creator', 'Cream', 'Hello! I''m Cream, 24, from Hua Hin. I love fashion, shopping, and going to the beach. I''m a social person who enjoys nightlife and meeting new people. Looking for a fun and generous man who wants to enjoy life and make memories together.', 'dating', now(), now()),
      (gen_random_uuid(), user_id_10, 'creator', 'Air', 'Hi! I''m Air, 26, from Ayutthaya. I''m a calm and thoughtful person who loves history, temples, and meditation. I work as a tour guide and love sharing Thai culture. Looking for a respectful, mature man who wants a deep and meaningful relationship.', 'dating', now(), now());

    -- Get profile IDs for media insertion
    SELECT id INTO profile_id_1 FROM profiles WHERE user_id = user_id_1;
    SELECT id INTO profile_id_2 FROM profiles WHERE user_id = user_id_2;
    SELECT id INTO profile_id_3 FROM profiles WHERE user_id = user_id_3;
    SELECT id INTO profile_id_4 FROM profiles WHERE user_id = user_id_4;
    SELECT id INTO profile_id_5 FROM profiles WHERE user_id = user_id_5;
    SELECT id INTO profile_id_6 FROM profiles WHERE user_id = user_id_6;
    SELECT id INTO profile_id_7 FROM profiles WHERE user_id = user_id_7;
    SELECT id INTO profile_id_8 FROM profiles WHERE user_id = user_id_8;
    SELECT id INTO profile_id_9 FROM profiles WHERE user_id = user_id_9;
    SELECT id INTO profile_id_10 FROM profiles WHERE user_id = user_id_10;

    -- Insert media for profiles using Pexels stock photos
    INSERT INTO media (profile_id, image_url, is_primary, created_at)
    VALUES
      (profile_id_1, 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg', true, now()),
      (profile_id_2, 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg', true, now()),
      (profile_id_3, 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', true, now()),
      (profile_id_4, 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg', true, now()),
      (profile_id_5, 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg', true, now()),
      (profile_id_6, 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg', true, now()),
      (profile_id_7, 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg', true, now()),
      (profile_id_8, 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg', true, now()),
      (profile_id_9, 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg', true, now()),
      (profile_id_10, 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg', true, now());
  END IF;
END $$;
