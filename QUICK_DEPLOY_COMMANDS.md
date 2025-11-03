# ⚡ Quick Deploy Commands

## Push to GitHub (Copy & Paste These)

```bash
# Step 1: Add all files
git add .

# Step 2: Commit with message
git commit -m "Initial commit - SAR School Management System"

# Step 3: Add your GitHub repo (REPLACE YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/sar-school-management.git

# Step 4: Push to GitHub
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANT:** Replace `YOUR-USERNAME` with your actual GitHub username!

---

## After Pushing to GitHub

1. **Go to Vercel:** https://vercel.com
2. **Sign in with GitHub**
3. **Click:** Add New... → Project
4. **Import:** sar-school-management
5. **Configure:**
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL = https://pwdkwhssrjuntbjqunco.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGt3aHNzcmp1bnRianF1bmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDA5MDcsImV4cCI6MjA3NzQxNjkwN30.cDSJDmrQRLYCZFddxOl8RVloQw5JZChVZMS3xEX7kFw
   ```
7. **Click:** Deploy
8. **Wait 2-3 minutes**
9. **Done!** 🎉

---

## Update Supabase After Deploy

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel URL to Site URL and Redirect URLs
4. Save

---

## Future Updates

After making changes to your code:

```bash
# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push (auto-deploys to Vercel!)
git push
```

That's it! Vercel automatically deploys every push. 🚀
