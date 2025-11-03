# Database Migration Guide

## Overview

This guide explains how to apply the database migrations for the SAR School Management System.

## Migration Files

The migrations are numbered and will be applied in order:

1. `20240101000000_create_core_tables.sql` - Core tables (profiles, academic structure, students, teachers, parents)
2. `20240101000001_create_assessment_tables.sql` - Attendance, assessments, and grades
3. `20240101000002_create_financial_communication_tables.sql` - Payments, announcements, messages, notifications, materials
4. `20240101000003_enable_rls_policies.sql` - Row Level Security policies (part 1)
5. `20240101000004_rls_policies_continued.sql` - Row Level Security policies (part 2)

## Method 1: Using Supabase CLI (Recommended for Development)

### Prerequisites
- Install Supabase CLI: https://supabase.com/docs/guides/cli

### Steps

1. **Initialize Supabase (if not already done)**
```bash
supabase init
```

2. **Link to your Supabase project**
```bash
supabase link --project-ref your-project-ref
```

3. **Apply all migrations**
```bash
supabase db push
```

Or reset the database (WARNING: This will delete all data):
```bash
supabase db reset
```

4. **Verify migrations**
```bash
supabase db diff
```

## Method 2: Using Supabase Dashboard (Production)

### Steps

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Click **Run** for each migration
5. Verify no errors occurred

### Important Notes for Dashboard Method
- Run migrations in the exact order listed above
- Wait for each migration to complete before running the next
- Check for any error messages after each migration
- If an error occurs, do not proceed to the next migration

## Method 3: Local Development with Docker

### Steps

1. **Start local Supabase**
```bash
supabase start
```

2. **Apply migrations**
```bash
supabase db reset
```

3. **Get local credentials**
```bash
supabase status
```

4. **Update your .env files with local credentials**

## Verifying the Migration

After applying migrations, verify the setup:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see 21 tables:
- academic_years
- announcements
- assessments
- attendance
- audit_logs
- class_subjects
- classes
- fee_structures
- grades
- materials
- messages
- notifications
- parents
- payments
- profiles
- student_parents
- students
- subjects
- teachers
- terms
- timetable_slots

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

### Check Helper Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

You should see:
- get_user_role()
- is_admin()
- is_teacher()
- get_teacher_id()
- get_student_id()
- is_parent_of(uuid)

## Creating Test Data

After migrations, you'll want to create test data. This will be covered in Task 19, but here's a quick example:

```sql
-- Create an admin user (run this after creating the user in Supabase Auth)
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'user-uuid-from-auth',
  'admin@sarschool.edu.gh',
  'admin',
  'Admin',
  'User'
);
```

## Troubleshooting

### Error: "relation already exists"
- The table was already created. Either drop it manually or use `supabase db reset` to start fresh.

### Error: "permission denied"
- Make sure you're connected to the correct project
- Verify you have admin access to the Supabase project

### Error: "function does not exist"
- Make sure you ran the RLS policy migrations (files 3 and 4)
- The helper functions must be created before the policies that use them

### RLS Policies Not Working
- Verify RLS is enabled: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;`
- Check if policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Test with different user roles to ensure policies work correctly

## Rolling Back Migrations

If you need to roll back:

### Using CLI
```bash
supabase db reset
```

### Manual Rollback
Drop tables in reverse order:
```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS student_parents CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS terms CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS is_parent_of(UUID);
DROP FUNCTION IF EXISTS get_student_id();
DROP FUNCTION IF EXISTS get_teacher_id();
DROP FUNCTION IF EXISTS is_teacher();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS get_user_role();
```

## Next Steps

After successfully applying migrations:
1. Create storage buckets (Task 3)
2. Set up authentication (Task 4)
3. Create seed data (Task 19)
4. Test RLS policies with different user roles
