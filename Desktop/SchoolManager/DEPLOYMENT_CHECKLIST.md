# ✅ Deployment Checklist

## Before You Start

- [ ] You have a GitHub account
- [ ] You have a Vercel account (or will create one)
- [ ] Your Supabase project is set up
- [ ] You've run the database setup script (START_HERE.md)

---

## Part 1: Create GitHub Repository

- [ ] Go to https://github.com/new
- [ ] Name: `sar-school-management`
- [ ] Visibility: Private (recommended)
- [ ] Click "Create repository"
- [ ] Copy the repository URL

---

## Part 2: Push Code to GitHub

Run these commands in your terminal:

- [ ] `git add .`
- [ ] `git commit -m "Initial commit - SAR School Management System"`
- [ ] `git remote add origin https://github.com/YOUR-USERNAME/sar-school-management.git`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`

**✅ Verify:** Go to your GitHub repository and see your code

---

## Part 3: Deploy to Vercel

- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Find and import `sar-school-management`

### Configure Settings:
- [ ] Root Directory: `apps/web`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Add Environment Variables:
- [ ] `VITE_SUPABASE_URL` = `https://pwdkwhssrjuntbjqunco.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGt3aHNzcmp1bnRianF1bmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDA5MDcsImV4cCI6MjA3NzQxNjkwN30.cDSJDmrQRLYCZFddxOl8RVloQw5JZChVZMS3xEX7kFw`

- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (2-3 minutes)

**✅ Verify:** You get a URL like `https://sar-school-management.vercel.app`

---

## Part 4: Configure Supabase

- [ ] Go to Supabase Dashboard
- [ ] Click "Authentication" → "URL Configuration"
- [ ] Add your Vercel URL to "Site URL"
- [ ] Add `https://your-vercel-url.vercel.app/**` to "Redirect URLs"
- [ ] Click "Save"

**✅ Verify:** URLs are saved in Supabase

---

## Part 5: Test Your Deployment

- [ ] Visit your Vercel URL
- [ ] Try registering a new account
- [ ] Try logging in
- [ ] Check if dashboard loads
- [ ] Test navigation between pages

**✅ Verify:** Everything works as expected

---

## Part 6: Database Setup (If Not Done)

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Copy code from `START_HERE.md`
- [ ] Paste and click "Run"
- [ ] Verify no errors

**✅ Verify:** Registration and login work

---

## 🎉 Deployment Complete!

Your app is now live at: `https://your-project-name.vercel.app`

### What Happens Next?

Every time you push to GitHub:
- ✅ Vercel automatically builds and deploys
- ✅ You get a preview URL for each commit
- ✅ Production updates automatically

---

## Quick Reference

- **GitHub Repo:** https://github.com/YOUR-USERNAME/sar-school-management
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Production URL:** https://your-project-name.vercel.app

---

## Troubleshooting

### Build Failed?
- Check Vercel build logs
- Verify Root Directory is `apps/web`
- Check environment variables are set

### Can't Login?
- Verify Supabase redirect URLs include your Vercel URL
- Run database setup script
- Check browser console for errors

### 404 Errors?
- Check `vercel.json` is in `apps/web` folder
- Verify routing configuration

---

## Need Help?

See `DEPLOY_TO_VERCEL.md` for detailed instructions!
