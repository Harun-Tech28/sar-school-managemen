# SAR School Management System - Setup Checklist

Follow these steps in order to get your system up and running.

## ✅ Phase 1: Supabase Setup

### 1.1 Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up for a free account
- [ ] Verify your email

### 1.2 Create New Project
- [ ] Click "New Project"
- [ ] Enter project name: "SAR School Management"
- [ ] Set a strong database password (save it!)
- [ ] Choose region closest to Ghana (e.g., Frankfurt or London)
- [ ] Wait 2-3 minutes for project to initialize

### 1.3 Get Project Credentials
- [ ] Go to Project Settings > API
- [ ] Copy **Project URL**
- [ ] Copy **anon/public key**
- [ ] Save these for next step

## ✅ Phase 2: Local Project Setup

### 2.1 Install Dependencies
```bash
cd sar-school-management
npm install
cd apps/web && npm install
cd ../mobile && npm install
cd ../../packages/shared && npm install
```

Or use shortcut:
```bash
npm run install:all
```

### 2.2 Configure Environment Variables

**Web App:**
- [ ] Copy `apps/web/.env.example` to `apps/web/.env`
- [ ] Edit `apps/web/.env` and paste your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Mobile App:**
- [ ] Copy `apps/mobile/.env.example` to `apps/mobile/.env`
- [ ] Edit `apps/mobile/.env` and paste your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## ✅ Phase 3: Database Setup

### 3.1 Run Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. [ ] Go to your Supabase project dashboard
2. [ ] Click **SQL Editor** in sidebar
3. [ ] Click **New Query**
4. [ ] Run each migration file in order:

   **Migration 1:**
   - [ ] Open `supabase/migrations/20240101000000_create_core_tables.sql`
   - [ ] Copy entire content
   - [ ] Paste in SQL Editor
   - [ ] Click **Run**
   - [ ] Verify "Success" message

   **Migration 2:**
   - [ ] Open `supabase/migrations/20240101000001_create_assessment_tables.sql`
   - [ ] Copy, paste, and run
   - [ ] Verify success

   **Migration 3:**
   - [ ] Open `supabase/migrations/20240101000002_create_financial_communication_tables.sql`
   - [ ] Copy, paste, and run
   - [ ] Verify success

   **Migration 4:**
   - [ ] Open `supabase/migrations/20240101000003_enable_rls_policies.sql`
   - [ ] Copy, paste, and run
   - [ ] Verify success

   **Migration 5:**
   - [ ] Open `supabase/migrations/20240101000004_rls_policies_continued.sql`
   - [ ] Copy, paste, and run
   - [ ] Verify success

   **Migration 6:**
   - [ ] Open `supabase/migrations/20240101000005_create_storage_buckets.sql`
   - [ ] Copy, paste, and run
   - [ ] Verify success

**Option B: Using Supabase CLI**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3.2 Verify Database Setup

In SQL Editor, run:
```sql
-- Should return 21 tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Should return 4 buckets
SELECT COUNT(*) FROM storage.buckets;
```

- [ ] Verify 21 tables exist
- [ ] Verify 4 storage buckets exist

## ✅ Phase 4: Create Test Users

### 4.1 Create Admin User

1. [ ] Go to **Authentication** > **Users** in Supabase Dashboard
2. [ ] Click **Add User**
3. [ ] Email: `admin@sarschool.edu.gh`
4. [ ] Password: `Admin@123` (or your choice)
5. [ ] Click **Create User**
6. [ ] Copy the user's UUID

7. [ ] Go to **SQL Editor**
8. [ ] Run this query (replace UUID):
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'paste-uuid-here',
  'admin@sarschool.edu.gh',
  'admin',
  'System',
  'Administrator'
);
```

### 4.2 Create Teacher User

1. [ ] Create auth user: `teacher@sarschool.edu.gh` / `Teacher@123`
2. [ ] Copy UUID
3. [ ] Run in SQL Editor (replace UUID):
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('paste-uuid-here', 'teacher@sarschool.edu.gh', 'teacher', 'John', 'Mensah');

INSERT INTO teachers (profile_id, teacher_id, hire_date, status)
VALUES ('paste-uuid-here', 'T001', '2024-01-01', 'active');
```

### 4.3 Create Student User

1. [ ] Create auth user: `student@sarschool.edu.gh` / `Student@123`
2. [ ] Copy UUID
3. [ ] Run in SQL Editor (replace UUID):
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('paste-uuid-here', 'student@sarschool.edu.gh', 'student', 'Kwame', 'Asante');

INSERT INTO students (profile_id, student_id, admission_date, status)
VALUES ('paste-uuid-here', 'S001', '2024-01-01', 'active');
```

### 4.4 Create Parent User

1. [ ] Create auth user: `parent@sarschool.edu.gh` / `Parent@123`
2. [ ] Copy UUID
3. [ ] Run in SQL Editor (replace UUIDs):
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('paste-uuid-here', 'parent@sarschool.edu.gh', 'parent', 'Akosua', 'Asante');

INSERT INTO parents (profile_id)
VALUES ('paste-uuid-here');

-- Link parent to student (get student ID first)
-- SELECT id FROM students WHERE student_id = 'S001';
INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
VALUES ('student-uuid', 'parent-uuid', 'Mother', true);
```

## ✅ Phase 5: Test the Application

### 5.1 Start Web App
```bash
npm run web
```
- [ ] App starts without errors
- [ ] Navigate to http://localhost:5173
- [ ] See login page with SAR branding

### 5.2 Test Admin Login
- [ ] Login with `admin@sarschool.edu.gh` / `Admin@123`
- [ ] Redirected to Admin Dashboard
- [ ] See "Welcome, Administrator" message
- [ ] Click Sign Out

### 5.3 Test Teacher Login
- [ ] Login with `teacher@sarschool.edu.gh` / `Teacher@123`
- [ ] Redirected to Teacher Portal
- [ ] See "Welcome, Teacher" message
- [ ] Click Sign Out

### 5.4 Test Student Login
- [ ] Login with `student@sarschool.edu.gh` / `Student@123`
- [ ] Redirected to Student Portal
- [ ] See "Welcome, Student" message
- [ ] Click Sign Out

### 5.5 Test Parent Login
- [ ] Login with `parent@sarschool.edu.gh` / `Parent@123`
- [ ] Redirected to Parent Portal
- [ ] See "Welcome, Parent" message
- [ ] Click Sign Out

### 5.6 Test Mobile App (Optional)
```bash
npm run mobile
```
- [ ] Scan QR code with Expo Go app
- [ ] App loads successfully
- [ ] See SAR branding

## ✅ Phase 6: Verify Security

### 6.1 Test RLS Policies
- [ ] Login as student
- [ ] Try to access `/admin` route
- [ ] Should see "Access Denied" page

### 6.2 Test Data Access
- [ ] Login as teacher
- [ ] Verify can only see assigned classes (when implemented)

### 6.3 Test Storage Access
- [ ] Go to Storage in Supabase Dashboard
- [ ] Verify 4 buckets exist
- [ ] Check policies are set

## 🎉 Setup Complete!

You now have:
- ✅ Supabase project configured
- ✅ Database with 21 tables
- ✅ Row Level Security enabled
- ✅ Storage buckets created
- ✅ Test users for all roles
- ✅ Working authentication
- ✅ Role-based routing

## 📚 Next Steps

Now you can:
1. Continue with Task 5: Build Admin Dashboard
2. Add more test data (classes, subjects, etc.)
3. Customize branding and colors
4. Deploy to production

## 📖 Additional Resources

- **Setup Guide**: `scripts/setup-database.md`
- **Migration Guide**: `supabase/MIGRATION_GUIDE.md`
- **Auth Guide**: `docs/AUTHENTICATION_GUIDE.md`
- **Storage Guide**: `supabase/STORAGE_GUIDE.md`
- **Quick Start**: `QUICKSTART.md`

## 🆘 Troubleshooting

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Supabase logs in dashboard
4. Review troubleshooting sections in guides
5. Ensure all migrations ran successfully

## 📝 Test Credentials Summary

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@sarschool.edu.gh       | Admin@123   |
| Teacher | teacher@sarschool.edu.gh     | Teacher@123 |
| Student | student@sarschool.edu.gh     | Student@123 |
| Parent  | parent@sarschool.edu.gh      | Parent@123  |

**Remember to change these passwords in production!**
