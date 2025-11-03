-- Quick diagnostic to check your account status
-- Replace 'your-email@example.com' with your actual email

-- Check if your user exists in auth.users
SELECT 
  'AUTH USER' as table_name,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE WHEN email_confirmed_at IS NULL THEN '⚠️ EMAIL NOT CONFIRMED' ELSE '✅ EMAIL CONFIRMED' END as email_status
FROM auth.users 
WHERE email = 'harunadramani951@gmail.com';

-- Check if your profile exists
SELECT 
  'PROFILE' as table_name,
  id,
  email,
  role,
  first_name,
  last_name,
  created_at
FROM profiles 
WHERE email = 'harunadramani951@gmail.com';

-- Check if your teacher record exists
SELECT 
  'TEACHER RECORD' as table_name,
  t.id,
  t.teacher_id,
  t.profile_id,
  t.status,
  p.email
FROM teachers t
JOIN profiles p ON t.profile_id = p.id
WHERE p.email = 'harunadramani951@gmail.com';

-- Summary
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'harunadramani951@gmail.com') 
    THEN '✅ User exists in auth.users'
    ELSE '❌ User NOT found in auth.users'
  END as auth_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'harunadramani951@gmail.com') 
    THEN '✅ Profile exists'
    ELSE '❌ Profile MISSING - This is the problem!'
  END as profile_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM teachers t 
      JOIN profiles p ON t.profile_id = p.id 
      WHERE p.email = 'harunadramani951@gmail.com'
    ) 
    THEN '✅ Teacher record exists'
    ELSE '⚠️ Teacher record missing'
  END as teacher_status;
