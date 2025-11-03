# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
cd apps/web && npm install
cd ../mobile && npm install
cd ../../packages/shared && npm install
cd ../..
```

Or use the shortcut:
```bash
npm run install:all
```

## Step 2: Set Up Supabase

### Option A: Use Supabase Cloud (Recommended for beginners)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for the project to be ready (2-3 minutes)
4. Go to Project Settings > API
5. Copy your:
   - Project URL
   - anon/public key

### Option B: Use Supabase Locally

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Start local Supabase:
```bash
supabase start
```

3. Get credentials:
```bash
supabase status
```

## Step 3: Configure Environment Variables

### Web App
```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env`:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Mobile App
```bash
cd apps/mobile
cp .env.example .env
```

Edit `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Set Up Database

The database migrations will be created in Task 2. For now, you can test the apps without database connectivity.

## Step 5: Run the Applications

### Web App
```bash
npm run web
```
Open http://localhost:5173 in your browser

### Mobile App
```bash
npm run mobile
```
- Scan the QR code with Expo Go app (iOS/Android)
- Or press 'w' to open in web browser
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

## Next Steps

1. Complete Task 2 to set up the database schema
2. Complete Task 4 to implement authentication
3. Start building the dashboards (Tasks 5-9)

## Troubleshooting

### "Cannot find module" errors
Run `npm run install:all` to ensure all dependencies are installed

### Supabase connection errors
- Check that your `.env` files have the correct credentials
- Verify your Supabase project is running
- Check the browser console for detailed error messages

### Mobile app won't start
- Make sure you have Expo CLI installed: `npm install -g expo-cli`
- Clear cache: `cd apps/mobile && npx expo start -c`

## Need Help?

Refer to the full documentation:
- [README.md](README.md) - Project overview
- [Supabase Setup](supabase/README.md) - Detailed Supabase guide
- [Design Document](.kiro/specs/sar-school-management-system/design.md) - Technical architecture
