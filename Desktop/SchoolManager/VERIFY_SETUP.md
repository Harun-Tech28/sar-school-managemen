# 🔍 Verify Your Setup

## Check 1: Are you in the right Supabase project?

Your app is configured to use: **pwdkwhssrjuntbjqunco.supabase.co**

1. Go to: https://supabase.com/dashboard
2. Make sure you're in the project: **pwdkwhssrjuntbjqunco**
3. Check the URL - it should be: `https://supabase.com/dashboard/project/pwdkwhssrjuntbjqunco`

## Check 2: Did you create the user in Authentication?

1. In Supabase, go to **Authentication** → **Users**
2. Do you see a user with email: `harunadramani5@gmail.com`?
3. If YES → Go to Check 3
4. If NO → You need to create the user (see below)

## Check 3: Did you create the profile in the database?

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Run this query:

```sql
SELECT * FROM profiles WHERE email = 'harunadramani5@gmail.com';
```

4. Do you see a row returned?
5. If YES → Your setup is correct! Try logging in again
6. If NO → You need to create the profile (see below)

---

## 🔧 Fix: Create User and Profile

If you're missing the user or profile, follow these steps:

### Step 1: Create Auth User
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: `harunadramani5@gmail.com`
4. Password: (choose a password you'll remember)
5. ✅ Check "Auto Confirm User"
6. Click **Create User**
7. **COPY THE USER ID** (the UUID)

### Step 2: Create Profile
1. Go to **SQL Editor**
2. Click **New Query**
3. Paste this (replace `YOUR-USER-ID` with the UUID you copied):

```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'YOUR-USER-ID',
  'harunadramani5@gmail.com',
  'admin',
  'Haruna',
  'Dramani'
);
```

4. Click **Run**

### Step 3: Test Login
1. Go back to: http://localhost:5175/
2. Login with:
   - Email: `harunadramani5@gmail.com`
   - Password: (the password you set)

---

## 🎯 Quick Verification Query

Run this in SQL Editor to see all your users:

```sql
-- Check auth users
SELECT id, email, created_at 
FROM auth.users;

-- Check profiles
SELECT id, email, role, first_name, last_name 
FROM profiles;

-- Check if they match
SELECT 
  au.email as auth_email,
  p.email as profile_email,
  p.role,
  CASE 
    WHEN au.id = p.id THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;
```

This will show you if your auth user and profile are properly linked!
