# 🚀 Deploy Commands for Harun

## Step 1: Create GitHub Repository First!

1. Go to: **https://github.com/new**
2. Repository name: **sar-school-management**
3. Make it **Private**
4. Click **Create repository**
5. Come back here and continue

---

## Step 2: Copy and Paste These Commands

Open your terminal and run these commands **ONE BY ONE**:

```bash
git add .
```

```bash
git commit -m "Initial commit - SAR School Management System"
```

```bash
git remote add origin https://github.com/Harun-Tech28/sar-school-management.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

**✅ Done!** Your code is now on GitHub at:
**https://github.com/Harun-Tech28/sar-school-management**

---

## Step 3: Deploy to Vercel

1. Go to: **https://vercel.com**
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub**
4. Click **Add New...** → **Project**
5. Find **sar-school-management** and click **Import**

### Configure Settings:
- **Root Directory:** Click "Edit" and type: `apps/web`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Add Environment Variables:
Click **Environment Variables** and add these:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://pwdkwhssrjuntbjqunco.supabase.co`

**Variable 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGt3aHNzcmp1bnRianF1bmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDA5MDcsImV4cCI6MjA3NzQxNjkwN30.cDSJDmrQRLYCZFddxOl8RVloQw5JZChVZMS3xEX7kFw`

6. Click **Deploy**
7. Wait 2-3 minutes ⏳

**✅ Done!** You'll get a URL like: `https://sar-school-management.vercel.app`

---

## Step 4: Update Supabase

1. Go to: **https://supabase.com/dashboard**
2. Click your project
3. Go to **Authentication** → **URL Configuration**
4. In **Site URL**, paste your Vercel URL
5. In **Redirect URLs**, add: `https://your-vercel-url.vercel.app/**`
6. Click **Save**

---

## Step 5: Run Database Setup (If Not Done)

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the code from **START_HERE.md**
3. Paste and click **Run**
4. Done!

---

## 🎉 Your Links

- **GitHub:** https://github.com/Harun-Tech28/sar-school-management
- **Vercel:** https://vercel.com/dashboard
- **Live App:** (You'll get this after deploying)

---

## Future Updates

When you make changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel automatically deploys! 🚀
