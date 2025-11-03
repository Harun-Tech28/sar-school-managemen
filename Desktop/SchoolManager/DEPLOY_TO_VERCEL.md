# 🚀 Deploy SAR School to Vercel

## Prerequisites
- GitHub account
- Vercel account (free - sign up at vercel.com)
- Supabase project (already set up)

---

## Step 1: Push to GitHub

### 1.1 Create a New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `sar-school-management`
3. Description: `SAR School Management System`
4. Choose **Private** (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### 1.2 Push Your Code
Copy and run these commands in your terminal:

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - SAR School Management System"

# Add your GitHub repository (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/sar-school-management.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR-USERNAME` with your actual GitHub username!

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Log In to Vercel
1. Go to https://vercel.com
2. Click **Sign Up** (or Log In if you have an account)
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub

### 2.2 Import Your Project
1. Click **Add New...** → **Project**
2. Find `sar-school-management` in the list
3. Click **Import**

### 2.3 Configure Project Settings
1. **Framework Preset:** Vite
2. **Root Directory:** `apps/web`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`

### 2.4 Add Environment Variables
Click **Environment Variables** and add:

```
VITE_SUPABASE_URL = https://pwdkwhssrjuntbjqunco.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGt3aHNzcmp1bnRianF1bmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDA5MDcsImV4cCI6MjA3NzQxNjkwN30.cDSJDmrQRLYCZFddxOl8RVloQw5JZChVZMS3xEX7kFw
```

### 2.5 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for deployment to complete
3. You'll get a URL like: `https://sar-school-management.vercel.app`

---

## Step 3: Configure Supabase for Production

### 3.1 Add Vercel URL to Supabase
1. Go to your Supabase Dashboard
2. Click **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**:
   ```
   https://your-project-name.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-project-name.vercel.app/**
   ```

### 3.2 Run the Database Setup (If Not Done)
1. Go to Supabase Dashboard → SQL Editor
2. Run the script from `START_HERE.md`
3. This ensures all users can register and login

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Try registering a new account
3. Try logging in
4. Test the dashboard features

---

## 🎉 You're Live!

Your SAR School Management System is now deployed and accessible from anywhere!

### Your URLs:
- **Production:** https://your-project-name.vercel.app
- **GitHub:** https://github.com/YOUR-USERNAME/sar-school-management
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## Automatic Deployments

Every time you push to GitHub, Vercel will automatically:
- ✅ Build your project
- ✅ Run tests
- ✅ Deploy to production
- ✅ Give you a preview URL

---

## Custom Domain (Optional)

Want to use your own domain like `school.sargh.com`?

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Done!

---

## Troubleshooting

### Build Fails
- Check the build logs in Vercel
- Make sure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Can't Login After Deployment
- Make sure you added the Vercel URL to Supabase redirect URLs
- Run the database setup script in Supabase
- Check browser console for errors

### 404 Errors
- Make sure Root Directory is set to `apps/web`
- Verify Build Command is `npm run build`
- Check Output Directory is `dist`

---

## Need Help?

If you run into issues:
1. Check Vercel build logs
2. Check browser console (F12)
3. Verify Supabase connection
4. Make sure database setup is complete

Happy deploying! 🚀
