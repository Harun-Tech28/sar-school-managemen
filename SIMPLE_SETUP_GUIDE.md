# 🚀 SAR School - Simple Setup Guide

Follow these 3 easy steps to get your system running!

## Step 1: Run the Database Setup (2 minutes)

1. Go to your Supabase project: https://pwdkwhssrjuntbjqunco.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/COMPLETE_SETUP.sql` in this project
5. Copy ALL the content (Ctrl+A, Ctrl+C)
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait 10-15 seconds
9. You should see: "Database setup complete! You can now create users and start using the system."

✅ Done! You now have 21 tables and 4 storage buckets ready!

## Step 2: Create Your First Admin User (1 minute)

1. In Supabase, click **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter:
   - Email: `admin@sarschool.edu.gh`
   - Password: `Admin@123` (or your choice)
   - ✅ Check "Auto Confirm User"
4. Click **Create User**
5. **COPY THE USER ID** (the long UUID that appears)

6. Go back to **SQL Editor**
7. Click **New Query**
8. Paste this (replace `YOUR-USER-ID-HERE` with the UUID you copied):

```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'YOUR-USER-ID-HERE',
  'admin@sarschool.edu.gh',
  'admin',
  'System',
  'Administrator'
);
```

9. Click **Run**

✅ Done! You now have an admin account!

## Step 3: Start the App and Login (30 seconds)

1. Open terminal in this project folder
2. Run:
```bash
cd apps/web
npm run dev
```

3. Open browser to: http://localhost:5174
4. Login with:
   - Email: `admin@sarschool.edu.gh`
   - Password: `Admin@123`

✅ Done! You're in the admin dashboard!

## 🎉 That's It!

You now have a fully working school management system with:
- ✅ Complete database (21 tables)
- ✅ Security policies (RLS enabled)
- ✅ File storage (4 buckets)
- ✅ Admin account
- ✅ Working authentication

## 📝 Create More Test Users (Optional)

Want to test teacher, student, or parent accounts? Here's how:

### Create a Teacher:
1. Authentication > Users > Add User
   - Email: `teacher@sarschool.edu.gh`
   - Password: `Teacher@123`
2. Copy the user ID
3. SQL Editor > New Query:
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('USER-ID-HERE', 'teacher@sarschool.edu.gh', 'teacher', 'John', 'Mensah');

INSERT INTO teachers (profile_id, teacher_id, hire_date, status)
VALUES ('USER-ID-HERE', 'T001', '2024-01-01', 'active');
```

### Create a Student:
1. Authentication > Users > Add User
   - Email: `student@sarschool.edu.gh`
   - Password: `Student@123`
2. Copy the user ID
3. SQL Editor > New Query:
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('USER-ID-HERE', 'student@sarschool.edu.gh', 'student', 'Kwame', 'Asante');

INSERT INTO students (profile_id, student_id, admission_date, status)
VALUES ('USER-ID-HERE', 'S001', '2024-01-01', 'active');
```

### Create a Parent:
1. Authentication > Users > Add User
   - Email: `parent@sarschool.edu.gh`
   - Password: `Parent@123`
2. Copy the user ID
3. SQL Editor > New Query:
```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('USER-ID-HERE', 'parent@sarschool.edu.gh', 'parent', 'Akosua', 'Asante');

INSERT INTO parents (profile_id)
VALUES ('USER-ID-HERE');
```

## 🆘 Troubleshooting

### "Can't connect to Supabase"
- Check your `.env` file in `apps/web/`
- Make sure the URL and API key match your project

### "Profile not found" when logging in
- Make sure you created the profile in the `profiles` table
- The profile `id` must match the auth user `id`

### "Access denied"
- Make sure the user's role in the `profiles` table is correct
- Try logging out and logging back in

## 🎯 Next Steps

Now that everything works, you can:
1. Build out the admin dashboard features
2. Add classes, subjects, and academic years
3. Customize the design and branding
4. Add more functionality

Happy coding! 🚀
