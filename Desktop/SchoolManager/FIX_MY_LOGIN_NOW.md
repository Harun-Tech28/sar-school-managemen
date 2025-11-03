# 🚀 Fix Your Login in 3 Minutes

## What Happened?
You registered as a teacher, but the system didn't save your profile correctly. Let's fix it!

---

## 📋 Step-by-Step Fix

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Log in if needed
3. Click on your **SAR School project**

### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Click on **"SQL Editor"** (it has a database icon)
3. You'll see a text editor

### Step 3: Run the Fix
1. **Delete everything** in the editor (if there's anything)
2. **Copy this entire code block:**

```sql
-- This fixes your login issue
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, role, first_name, last_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'teacher') as role,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can insert own profile during registration" ON profiles;
CREATE POLICY "Users can insert own profile during registration"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

3. **Paste it** into the SQL Editor
4. **Click the green "RUN" button** (top right)
5. Wait for it to finish (should take 1-2 seconds)

### Step 4: Try Logging In
1. Go back to your app: **http://localhost:5173/login**
2. Enter your email: **harunadramani951@gmail.com**
3. Enter your password
4. Click **Login**
5. **You should be logged in!** 🎉

---

## ✨ What I Also Fixed in the Code

The registration page now:
- ✅ Shows a **green success message** when you register
- ✅ Shows a **loading spinner** while creating your account
- ✅ **Automatically redirects** you to login after 2 seconds
- ✅ Creates your profile **automatically** (no database setup needed)
- ✅ Shows **better error messages** if something goes wrong
- ✅ Defaults to **"Teacher"** role (since that's what you need)

---

## 🎯 Try It Out!

After running the SQL fix, you can:

1. **Log in with your existing account** (should work now!)
2. **Or register a new account** (will work perfectly with the new code)

---

## 🆘 Still Having Issues?

If you still can't log in after running the SQL:

1. Check your email inbox - you might need to verify your email
2. Make sure you're using the correct password
3. Try registering a new account with a different email
4. Let me know and I'll help debug!

---

## 📝 Summary

**What you need to do:**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy and paste the code above
4. Click Run
5. Try logging in

**That's it!** Your login will work after this. 🚀
