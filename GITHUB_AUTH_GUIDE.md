# 🔐 GitHub Authentication Guide

## The Issue
GitHub requires authentication to push code. You need a Personal Access Token (PAT).

---

## Quick Fix: Use GitHub Desktop (Easiest!)

### Option 1: GitHub Desktop (Recommended - No Terminal Needed!)

1. **Download GitHub Desktop:** https://desktop.github.com
2. **Install and sign in** with your GitHub account
3. **File** → **Add Local Repository**
4. **Browse** to: `C:\Users\user\Desktop\SchoolManager`
5. **Click** "Add Repository"
6. **Click** "Publish repository" button
7. **Uncheck** "Keep this code private" if you want it public
8. **Click** "Publish Repository"
9. **Done!** ✅

---

## Option 2: Create Personal Access Token (For Terminal)

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** "SAR School Management"
4. **Expiration:** 90 days (or No expiration)
5. **Select scopes:** Check **"repo"** (this checks all repo boxes)
6. Scroll down and click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with Token
Run this command (replace YOUR_TOKEN with the token you copied):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Harun-Tech28/sar-school-management.git
git push -u origin main
```

---

## Option 3: Use SSH (Advanced)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "harunadramani951@gmail.com"
```
Press Enter 3 times (accept defaults)

### Step 2: Copy SSH Key
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy the output

### Step 3: Add to GitHub
1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: "My Computer"
4. Paste the key
5. Click **"Add SSH key"**

### Step 4: Update Remote and Push
```bash
git remote set-url origin git@github.com:Harun-Tech28/sar-school-management.git
git push -u origin main
```

---

## 🎯 Recommended: Use GitHub Desktop

It's the easiest way and handles authentication automatically!

1. Download: https://desktop.github.com
2. Sign in
3. Add your local repository
4. Publish
5. Done! ✅

---

## After Successful Push

Your code will be at:
**https://github.com/Harun-Tech28/sar-school-management**

Then follow **DEPLOY_FOR_HARUN.md** to deploy to Vercel!
