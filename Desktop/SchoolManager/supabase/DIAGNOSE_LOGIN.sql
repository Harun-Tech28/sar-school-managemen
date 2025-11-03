-- ============================================
-- DIAGNOSE LOGIN ISSUES
-- ============================================
-- Run this script to see what's missing

-- Check 1: Do you have any auth users?
SELECT 'AUTH USERS:' as check_type;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users;

-- Check 2: Do you have any profiles?
SELECT 'PROFILES:' as check_type;
SELECT id, email, role, first_name, last_name 
FROM profiles;

-- Check 3: Are they linked correctly?
SELECT 'MATCHING CHECK:' as check_type;
SELECT 
  au.email as auth_email,
  au.id as auth_id,
  p.email as profile_email,
  p.role as profile_role,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE - THIS IS YOUR PROBLEM!'
    WHEN au.id = p.id THEN '✅ Correctly Linked'
    ELSE '❌ ID Mismatch'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;
