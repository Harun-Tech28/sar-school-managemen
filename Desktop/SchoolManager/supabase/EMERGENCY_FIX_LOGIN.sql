-- EMERGENCY FIX FOR LOGIN ISSUES
-- This script fixes registration and login problems

-- ============================================
-- STEP 1: Create the auto-profile trigger
-- ============================================

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 2: Fix existing users without profiles
-- ============================================

-- Create profiles for any auth.users that don't have profiles yet
INSERT INTO public.profiles (id, email, role, first_name, last_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'student') as role,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Add RLS policy for new user registration
-- ============================================

-- Allow users to insert their own profile during registration
DROP POLICY IF EXISTS "Users can insert own profile during registration" ON profiles;
CREATE POLICY "Users can insert own profile during registration"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: Verify the fix
-- ============================================

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if all users have profiles
SELECT 
  COUNT(*) as users_without_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show all users and their profiles
SELECT 
  au.email,
  au.created_at as user_created,
  p.role,
  p.first_name,
  p.last_name,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'OK' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
