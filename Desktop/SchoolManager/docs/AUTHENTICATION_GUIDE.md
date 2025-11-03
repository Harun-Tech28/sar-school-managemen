# Authentication System Guide

## Overview

The SAR School Management System uses Supabase Authentication with role-based access control. Users are authenticated via email/password and assigned one of four roles: Admin, Teacher, Student, or Parent.

## Architecture

### Components

1. **AuthService** (`apps/web/src/services/authService.ts`)
   - Handles all authentication operations
   - Manages user sessions
   - Fetches user profiles and roles

2. **AuthContext** (`apps/web/src/contexts/AuthContext.tsx`)
   - Provides authentication state throughout the app
   - Exposes auth methods via React hooks

3. **ProtectedRoute** (`apps/web/src/components/ProtectedRoute.tsx`)
   - Wraps routes that require authentication
   - Redirects unauthenticated users to login

4. **RoleGuard** (`apps/web/src/components/RoleGuard.tsx`)
   - Enforces role-based access control
   - Redirects unauthorized users

## User Roles

### Admin
- Full access to all system features
- Can manage users, classes, subjects, payments
- Access route: `/admin/*`

### Teacher
- Manage assigned classes
- Mark attendance and record grades
- Upload materials and communicate with students/parents
- Access route: `/teacher/*`

### Student
- View own academic information
- Access timetable, results, and materials
- Access route: `/student/*`

### Parent
- View children's academic information
- Make payments and communicate with teachers
- Access route: `/parent/*`

## Authentication Flow

### Sign In Process

1. User enters email and password on login page
2. `authService.signIn()` calls Supabase Auth
3. On success, fetch user profile from `profiles` table
4. Extract user role from profile
5. Store user in AuthContext
6. Redirect to role-specific dashboard

```typescript
const { signIn } = useAuth()

const handleLogin = async () => {
  const { error } = await signIn(email, password)
  if (!error) {
    // User is redirected automatically based on role
  }
}
```

### Session Management

- Sessions are persisted in browser localStorage
- Tokens are automatically refreshed by Supabase
- Session state is monitored via `onAuthStateChange`

### Sign Out Process

1. User clicks sign out button
2. `authService.signOut()` clears Supabase session
3. User state is cleared from AuthContext
4. User is redirected to login page

## Usage Examples

### Using the Auth Hook

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, role, isAuthenticated, signOut } = useAuth()

  return (
    <div>
      {isAuthenticated && (
        <>
          <p>Welcome, {user?.email}</p>
          <p>Role: {role}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      )}
    </div>
  )
}
```

### Protecting Routes

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Role-Based Access

```typescript
import { RoleGuard } from '@/components/RoleGuard'

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={['admin']}>
        <AdminDashboard />
      </RoleGuard>
    </ProtectedRoute>
  }
/>
```

### Checking Roles in Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { role } = useAuth()

  return (
    <div>
      {role === 'admin' && <AdminPanel />}
      {role === 'teacher' && <TeacherPanel />}
      {(role === 'student' || role === 'parent') && <ViewOnlyPanel />}
    </div>
  )
}
```

## Creating Users

### Via Supabase Dashboard

1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. User is created in `auth.users`

### Create Profile Entry

After creating a user in Supabase Auth, you must create a profile:

```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'admin', -- or 'teacher', 'student', 'parent'
  'First',
  'Last'
);
```

### Complete User Setup

For teachers, students, and parents, also create entries in their respective tables:

```sql
-- For teachers
INSERT INTO teachers (profile_id, teacher_id, hire_date)
VALUES ('profile-uuid', 'T001', '2024-01-01');

-- For students
INSERT INTO students (profile_id, student_id, class_id, admission_date)
VALUES ('profile-uuid', 'S001', 'class-uuid', '2024-01-01');

-- For parents
INSERT INTO parents (profile_id)
VALUES ('profile-uuid');

-- Link parent to student
INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
VALUES ('student-uuid', 'parent-uuid', 'Father', true);
```

## Testing Authentication

### Test Users

Create test users for each role:

```sql
-- Admin user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'admin-uuid',
  'admin@sarschool.edu.gh',
  'admin',
  'Admin',
  'User'
);

-- Teacher user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'teacher-uuid',
  'teacher@sarschool.edu.gh',
  'teacher',
  'John',
  'Doe'
);

INSERT INTO teachers (profile_id, teacher_id, hire_date)
VALUES ('teacher-uuid', 'T001', '2024-01-01');

-- Student user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'student-uuid',
  'student@sarschool.edu.gh',
  'student',
  'Jane',
  'Smith'
);

INSERT INTO students (profile_id, student_id, admission_date)
VALUES ('student-uuid', 'S001', '2024-01-01');

-- Parent user
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'parent-uuid',
  'parent@sarschool.edu.gh',
  'parent',
  'Mary',
  'Smith'
);

INSERT INTO parents (profile_id)
VALUES ('parent-uuid');

INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
VALUES ('student-uuid', 'parent-uuid', 'Mother', true);
```

### Test Credentials

Set passwords in Supabase Dashboard:
- admin@sarschool.edu.gh / password123
- teacher@sarschool.edu.gh / password123
- student@sarschool.edu.gh / password123
- parent@sarschool.edu.gh / password123

## Security Features

### Row Level Security (RLS)

All database tables have RLS policies that check user roles:

```sql
-- Example: Students can only view their own records
CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  USING (profile_id = auth.uid());
```

### Token-Based Authentication

- JWT tokens are used for API requests
- Tokens are automatically included in Supabase client requests
- Tokens expire and are refreshed automatically

### Password Requirements

Configure in Supabase Dashboard > Authentication > Settings:
- Minimum length: 8 characters
- Require uppercase, lowercase, numbers (recommended)

## Troubleshooting

### "User profile not found" Error

**Cause**: User exists in `auth.users` but not in `profiles` table

**Solution**: Create profile entry for the user

```sql
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES ('user-uuid', 'email@example.com', 'role', 'First', 'Last');
```

### "Access Denied" After Login

**Cause**: User role doesn't match route requirements

**Solution**: 
1. Check user's role in `profiles` table
2. Verify RoleGuard allows that role
3. Check RLS policies

### Session Expires Immediately

**Cause**: Token refresh failing or RLS policy blocking profile fetch

**Solution**:
1. Check browser console for errors
2. Verify RLS policies allow profile reads
3. Check Supabase project settings

### Can't Sign In

**Possible causes**:
1. Wrong email/password
2. User not confirmed (if email confirmation enabled)
3. User disabled in Supabase Dashboard
4. Network/CORS issues

**Solution**:
1. Verify credentials
2. Check user status in Supabase Dashboard
3. Check browser console for errors

## Password Reset

### Implementing Password Reset

```typescript
import { authService } from '@/services/authService'

const handlePasswordReset = async (email: string) => {
  const { error } = await authService.resetPassword(email)
  if (!error) {
    alert('Password reset email sent!')
  }
}
```

### Reset Flow

1. User clicks "Forgot Password"
2. Enters email address
3. Receives reset link via email
4. Clicks link to reset password page
5. Enters new password
6. Password is updated

## Best Practices

1. **Never store passwords in code or database**
   - Use Supabase Auth for password management

2. **Always check authentication before sensitive operations**
   ```typescript
   const { isAuthenticated } = useAuth()
   if (!isAuthenticated) return
   ```

3. **Use role guards for all protected routes**
   ```typescript
   <RoleGuard allowedRoles={['admin', 'teacher']}>
     <SensitiveComponent />
   </RoleGuard>
   ```

4. **Handle loading states**
   ```typescript
   const { loading } = useAuth()
   if (loading) return <LoadingSpinner />
   ```

5. **Implement proper error handling**
   ```typescript
   const { error } = await signIn(email, password)
   if (error) {
     // Show user-friendly error message
   }
   ```

## Next Steps

After authentication is working:
1. Test login with all user roles
2. Verify role-based routing works correctly
3. Test RLS policies with different users
4. Implement password reset functionality
5. Add email confirmation (optional)
6. Set up 2FA (optional, for admins)
