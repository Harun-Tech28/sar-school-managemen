# Database Setup Instructions

## Prerequisites

Before running migrations, you need:

1. **A Supabase Account**
   - Sign up at https://supabase.com (free tier available)

2. **A Supabase Project**
   - Create a new project in your Supabase dashboard
   - Wait 2-3 minutes for project initialization

3. **Supabase CLI** (Optional but recommended)
   - Install: `npm install -g supabase`
   - Or use the dashboard method below

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Access SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migrations in Order

Copy and paste each migration file content into the SQL Editor and click **Run**.

**IMPORTANT: Run them in this exact order:**

#### Migration 1: Core Tables
```
File: supabase/migrations/20240101000000_create_core_tables.sql
```
- Creates profiles, academic_years, terms, classes, subjects
- Creates students, teachers, parents tables
- Creates relationships and indexes

#### Migration 2: Assessment Tables
```
File: supabase/migrations/20240101000001_create_assessment_tables.sql
```
- Creates attendance table
- Creates assessments and grades tables

#### Migration 3: Financial & Communication Tables
```
File: supabase/migrations/20240101000002_create_financial_communication_tables.sql
```
- Creates fee_structures and payments tables
- Creates announcements, messages, notifications tables
- Creates materials and audit_logs tables

#### Migration 4: RLS Policies (Part 1)
```
File: supabase/migrations/20240101000003_enable_rls_policies.sql
```
- Enables Row Level Security on all tables
- Creates helper functions for role checking
- Creates RLS policies for core tables

#### Migration 5: RLS Policies (Part 2)
```
File: supabase/migrations/20240101000004_rls_policies_continued.sql
```
- Completes RLS policies for all tables
- Grants necessary permissions

#### Migration 6: Storage Buckets
```
File: supabase/migrations/20240101000005_create_storage_buckets.sql
```
- Creates storage buckets (documents, materials, reports, profile-images)
- Sets up storage policies

### Step 3: Verify Setup

After running all migrations, verify in SQL Editor:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 21 tables.

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

```sql
-- Check storage buckets
SELECT * FROM storage.buckets;
```

You should see 4 buckets: documents, materials, reports, profile-images.

## Method 2: Using Supabase CLI (Advanced)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Link to Your Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

Find your project ref in: Project Settings > General > Reference ID

### Step 3: Push Migrations

```bash
# Push all migrations to your project
supabase db push
```

This will automatically run all migration files in order.

### Step 4: Verify

```bash
# Check migration status
supabase migration list

# Check database diff (should be empty if all applied)
supabase db diff
```

## Method 3: Local Development with Supabase CLI

### Step 1: Start Local Supabase

```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase (requires Docker)
supabase start
```

### Step 2: Apply Migrations

```bash
# Reset database with all migrations
supabase db reset
```

### Step 3: Get Local Credentials

```bash
supabase status
```

Copy the API URL and anon key to your `.env` files.

## Post-Migration Setup

### 1. Configure Environment Variables

**Web App** (`apps/web/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Mobile App** (`apps/mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Create Test Users

You need to create users in two steps:

#### Step A: Create Auth User

In Supabase Dashboard:
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Copy the user's UUID

#### Step B: Create Profile

In SQL Editor, run:

```sql
-- Admin user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'paste-user-uuid-here',
  'admin@sarschool.edu.gh',
  'admin',
  'Admin',
  'User'
);

-- Teacher user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'paste-user-uuid-here',
  'teacher@sarschool.edu.gh',
  'teacher',
  'John',
  'Doe'
);

-- Create teacher record
INSERT INTO teachers (profile_id, teacher_id, hire_date, status)
VALUES (
  'paste-profile-uuid-here',
  'T001',
  '2024-01-01',
  'active'
);

-- Student user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'paste-user-uuid-here',
  'student@sarschool.edu.gh',
  'student',
  'Jane',
  'Smith'
);

-- Create student record
INSERT INTO students (profile_id, student_id, admission_date, status)
VALUES (
  'paste-profile-uuid-here',
  'S001',
  '2024-01-01',
  'active'
);

-- Parent user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'paste-user-uuid-here',
  'parent@sarschool.edu.gh',
  'parent',
  'Mary',
  'Smith'
);

-- Create parent record
INSERT INTO parents (profile_id)
VALUES ('paste-profile-uuid-here');

-- Link parent to student
INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
VALUES (
  'paste-student-uuid-here',
  'paste-parent-uuid-here',
  'Mother',
  true
);
```

### 3. Test Login

1. Start the web app: `npm run web`
2. Navigate to http://localhost:5173
3. Try logging in with your test users
4. Verify you're redirected to the correct dashboard based on role

## Troubleshooting

### Error: "relation already exists"

**Solution**: The table was already created. Either:
- Skip that migration
- Or drop all tables and start fresh:

```sql
-- WARNING: This deletes all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then run migrations again.

### Error: "permission denied"

**Solution**: Make sure you're using the correct Supabase project and have admin access.

### Error: "function does not exist"

**Solution**: Make sure you ran migration 3 (RLS policies part 1) which creates the helper functions.

### Storage buckets not created

**Solution**: 
1. Check if migration 6 ran successfully
2. Or create buckets manually in Storage section of dashboard
3. Follow instructions in `supabase/STORAGE_GUIDE.md`

### Can't login after creating user

**Possible causes**:
1. Profile not created in `profiles` table
2. Wrong role assigned
3. RLS policies blocking access

**Solution**:
1. Verify profile exists: `SELECT * FROM profiles WHERE email = 'user@example.com';`
2. Check role is correct
3. Check browser console for errors

## Next Steps

After successful migration:

1. ✅ Database schema is set up
2. ✅ RLS policies are active
3. ✅ Storage buckets are created
4. ✅ Test users are created

Now you can:
- Start the web app: `npm run web`
- Start the mobile app: `npm run mobile`
- Begin implementing features (Tasks 5+)

## Quick Reference

### Supabase Dashboard URLs
- Project Dashboard: https://app.supabase.com/project/your-project-ref
- SQL Editor: https://app.supabase.com/project/your-project-ref/sql
- Authentication: https://app.supabase.com/project/your-project-ref/auth/users
- Storage: https://app.supabase.com/project/your-project-ref/storage/buckets

### Important Files
- Migration Guide: `supabase/MIGRATION_GUIDE.md`
- Storage Guide: `supabase/STORAGE_GUIDE.md`
- Auth Guide: `docs/AUTHENTICATION_GUIDE.md`
- Quick Start: `QUICKSTART.md`

### Support
If you encounter issues:
1. Check the troubleshooting sections in the guides
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify environment variables are set correctly
