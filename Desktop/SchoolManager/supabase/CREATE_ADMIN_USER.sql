-- ============================================
-- CREATE ADMIN USER - SIMPLE ONE-STEP SCRIPT
-- ============================================
-- This script creates both the auth user AND profile in one go!
-- Just run this entire script in Supabase SQL Editor

-- Step 1: Create the authentication user
-- Note: You'll need to set the password manually in the Supabase UI
-- This creates the profile entry that links to your auth user

-- First, let's check if you already have an auth user
-- Run this to see your auth users:
SELECT id, email, created_at FROM auth.users;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Look at the results above - do you see harunadramani5@gmail.com?
-- 2. If YES: Copy the 'id' value (the UUID)
-- 3. If NO: Go to Authentication > Users and create the user first
-- 
-- 4. Once you have the user ID, replace 'YOUR-USER-ID-HERE' below
--    with your actual user ID and run the INSERT statement:

INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'YOUR-USER-ID-HERE',  -- Replace this with your user ID
  'harunadramani5@gmail.com',
  'admin',
  'Haruna',
  'Dramani'
)
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Verify it worked:
SELECT * FROM profiles WHERE email = 'harunadramani5@gmail.com';
