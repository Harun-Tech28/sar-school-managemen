# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Install Supabase CLI: https://supabase.com/docs/guides/cli

## Local Development Setup

1. Initialize Supabase locally:
```bash
supabase init
```

2. Start local Supabase:
```bash
supabase start
```

3. Apply migrations:
```bash
supabase db reset
```

4. Get your local credentials:
```bash
supabase status
```

5. Copy the API URL and anon key to your `.env` files

## Production Setup

1. Create a new project in Supabase Dashboard
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key
4. Update your production `.env` files with these credentials

## Database Migrations

All database migrations are in the `supabase/migrations` folder. They will be applied automatically when you run `supabase db reset` or push to production.

## Storage Buckets

The following storage buckets need to be created:
- `documents` - For school documents and forms
- `materials` - For teaching materials and assignments
- `reports` - For generated report cards
- `profile-images` - For user profile photos

You can create these manually in the Supabase Dashboard or use the provided migration.

## Row Level Security (RLS)

All tables have RLS enabled with policies based on user roles. Make sure to test access with different user roles during development.
