# Registration Foreign Key Fix

## Problem
Registration was failing with error: `insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"`

This happened because the code was trying to insert into the `profiles` table before the user was fully committed to `auth.users`.

## Solution
Created a database trigger that automatically creates a profile whenever a new user signs up in `auth.users`.

## Steps to Apply the Fix

### Option 1: Run the SQL Script (Recommended)
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/FIX_REGISTRATION.sql`
4. Click "Run"

### Option 2: Apply the Migration
If you're using Supabase CLI:
```bash
supabase db push
```

## What Changed

### Database
- Created `handle_new_user()` function that automatically creates a profile
- Created `on_auth_user_created` trigger that fires when a user signs up
- The trigger reads user metadata (first_name, last_name, role) and creates the profile automatically

### Code
- Updated `RegisterPage.tsx` to pass user data in the signup metadata
- Removed manual profile creation (now handled by the trigger)
- Added a 1-second delay to ensure the trigger completes

## Testing
After applying the fix, try registering a new user:
1. Go to the registration page
2. Fill in the form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Role: Teacher
   - Password: password123
3. Click Register
4. You should see "Registration successful! Please login."

## How It Works Now
1. User fills registration form
2. Frontend calls `supabase.auth.signUp()` with user metadata
3. Supabase creates user in `auth.users`
4. Database trigger automatically creates matching profile in `profiles` table
5. Frontend creates role-specific record (teacher/student/parent)
6. User is redirected to login

## Benefits
- No more foreign key constraint errors
- Cleaner code (no manual profile creation)
- Guaranteed profile creation for every user
- Atomic operation (profile created in same transaction as user)
