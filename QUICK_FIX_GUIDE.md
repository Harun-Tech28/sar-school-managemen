# 🔧 Quick Fix for Schema Cache Error

## The Error You're Seeing:
```
Could not find a relationship between 'students' and 'classes' in the schema cache
```

## ✅ The Solution (Takes 30 seconds):

### Step 1: Go to Supabase Dashboard
Open your Supabase project dashboard at: https://supabase.com/dashboard

### Step 2: Refresh the Schema
Choose ONE of these methods:

**Method A: Restart Server (Easiest)**
1. Go to **Settings** → **API**
2. Click **"Restart Server"** button
3. Wait 30 seconds

**Method B: Run SQL Command (Fastest)**
1. Go to **SQL Editor**
2. Paste this command:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
3. Click **Run**

**Method C: Use the Script**
1. Go to **SQL Editor**
2. Open `supabase/REFRESH_SCHEMA.sql` from your project
3. Copy all content and paste it
4. Click **Run**

### Step 3: Refresh Your App
- Refresh your browser (F5 or Cmd+R)
- The error should be gone!

## Why This Happens:
Supabase caches the database schema for performance. When you add new tables or relationships, the cache needs to be refreshed. This is normal and happens to everyone!

## That's It!
No code changes needed. The relationship exists in your database - Supabase just needs to reload it into memory.

---

**Need more details?** See `FIX_SCHEMA_CACHE_ERROR.md` for comprehensive troubleshooting.
