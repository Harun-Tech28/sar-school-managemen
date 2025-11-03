# 🚨 EMERGENCY LOGIN FIX

## Problem
You registered as a teacher but can't log in because the profile wasn't created in the database.

## Quick Fix (Do This Now!)

### Step 1: Apply the Database Fix
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `supabase/EMERGENCY_FIX_LOGIN.sql`
4. Click **Run**

This will:
- ✅ Create the auto-profile trigger for future registrations
- ✅ Create profiles for ALL existing users (including you!)
- ✅ Add the necessary RLS policy for registration
- ✅ Show you a verification report

### Step 2: Try Logging In Again
After running the SQL script:
1. Go to the login page
2. Enter your email and password
3. You should now be able to log in!

## What This Fix Does

### 1. Auto-Profile Trigger
Creates a database trigger that automatically creates a profile whenever someone signs up. This prevents the issue from happening again.

### 2. Backfill Missing Profiles
Finds all users in `auth.users` who don't have a profile and creates one for them using their signup metadata.

### 3. RLS Policy
Adds a Row Level Security policy that allows users to insert their own profile during registration.

### 4. Verification
Shows you:
- Whether the trigger was created successfully
- How many users are missing profiles (should be 0 after the fix)
- A list of all users and their profile status

## Verification

After running the script, you should see output like:

```
trigger_name: on_auth_user_created
event_manipulation: INSERT
event_object_table: users

users_without_profiles: 0

email                          | role    | first_name | last_name | status
-------------------------------|---------|------------|-----------|--------
harunadramani951@gmail.com    | teacher | HARUNA     | DRAMANI   | OK
```

## If You Still Can't Log In

If you still have issues after running the script:

1. **Check your email confirmation**: Some Supabase projects require email confirmation. Check your email inbox.

2. **Verify your credentials**: Make sure you're using the correct email and password.

3. **Check the browser console**: Open Developer Tools (F12) and look for error messages.

4. **Manual profile creation**: Run this in SQL Editor (replace with your actual email):
```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Create profile manually (use the ID from above)
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'your-user-id-here',
  'your-email@example.com',
  'teacher',
  'Your First Name',
  'Your Last Name'
);
```

## Future Registrations

After applying this fix, all future registrations will automatically create profiles. The trigger handles this automatically, so you won't have this problem again.

## Need More Help?

If you're still having issues, let me know and I can help debug further!
