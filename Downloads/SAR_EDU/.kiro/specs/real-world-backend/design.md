# Design Document - Real-World Backend Implementation

## Overview

This design document outlines the architecture for transforming the SAR Educational Complex School Management System into a production-ready application with Prisma ORM, PostgreSQL database, and Next.js API routes.

## Technology Stack

### Backend
- **Framework**: Next.js 16 API Routes
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod (already in dependencies)
- **Password Hashing**: bcryptjs

### Why This Stack?
1. **Prisma**: Type-safe database access, excellent migrations, great DX
2. **PostgreSQL**: Robust, ACID compliant, perfect for relational school data
3. **NextAuth.js**: Industry standard for Next.js authentication
4. **All-in-one**: Everything in Next.js - no separate backend needed

## Database Schema Design

### Core Entities

```prisma
// User Management
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  fullName      String
  role          Role
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  student       Student?
  teacher       Teacher?
  parent        Parent?
  admin         Admin?
}

enum Role {
  ADMIN
  TEACHER
  PARENT
  STUDENT
}

// Student Entity
model Student {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  rollNumber    String   @unique
  classId       String
  class         Class    @relation(fields: [classId], references: [id])
  dateOfBirth   DateTime
  gender        String
  address       String
  phone         String?
  parentId      String?
  parent        Parent?  @relation(fields: [parentId], references: [id])
  
  // Relations
  attendance    Attendance[]
  grades        Grade[]
  homeworkSubmissions HomeworkSubmission[]
  feePayments   FeePayment[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Teacher Entity
model Teacher {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  employeeId    String   @unique
  subjects      String[]
  phone         String
  
  // Relations
  classes       ClassTeacher[]
  homework      Homework[]
  grades        Grade[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Parent Entity
model Parent {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  phone         String
  occupation    String?
  
  // Relations
  children      Student[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Admin Entity
model Admin {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  department    String
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Class Entity
model Class {
  id            String   @id @default(cuid())
  name          String   @unique
  level         String
  section       String
  academicYear  String
  
  // Relations
  students      Student[]
  teachers      ClassTeacher[]
  homework      Homework[]
  attendance    Attendance[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Class-Teacher Junction
model ClassTeacher {
  id            String   @id @default(cuid())
  classId       String
  class         Class    @relation(fields: [classId], references: [id])
  teacherId     String
  teacher       Teacher  @relation(fields: [teacherId], references: [id])
  subject       String
  
  @@unique([classId, teacherId, subject])
}

// Attendance Entity
model Attendance {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  classId       String
  class         Class    @relation(fields: [classId], references: [id])
  date          DateTime
  status        AttendanceStatus
  remarks       String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([studentId, date])
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

// Homework Entity
model Homework {
  id            String   @id @default(cuid())
  title         String
  description   String
  subject       String
  classId       String
  class         Class    @relation(fields: [classId], references: [id])
  teacherId     String
  teacher       Teacher  @relation(fields: [teacherId], references: [id])
  dueDate       DateTime
  totalMarks    Int?
  
  // Relations
  submissions   HomeworkSubmission[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Homework Submission Entity
model HomeworkSubmission {
  id            String   @id @default(cuid())
  homeworkId    String
  homework      Homework @relation(fields: [homeworkId], references: [id])
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  submittedAt   DateTime?
  grade         Int?
  feedback      String?
  status        SubmissionStatus
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([homeworkId, studentId])
}

enum SubmissionStatus {
  PENDING
  SUBMITTED
  GRADED
  LATE
}

// Grade Entity
model Grade {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  teacherId     String
  teacher       Teacher  @relation(fields: [teacherId], references: [id])
  subject       String
  examType      String
  marks         Float
  totalMarks    Float
  term          String
  academicYear  String
  remarks       String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Fee Structure Entity
model FeeStructure {
  id            String   @id @default(cuid())
  className     String
  academicYear  String
  tuition       Float
  textbooks     Float
  uniform       Float
  pta           Float
  other         Float?
  total         Float
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([className, academicYear])
}

// Fee Payment Entity
model FeePayment {
  id            String   @id @default(cuid())
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id])
  amount        Float
  paymentDate   DateTime
  paymentMethod String
  term          String
  academicYear  String
  receiptNumber String   @unique
  remarks       String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Announcement Entity
model Announcement {
  id            String   @id @default(cuid())
  title         String
  content       String
  targetRole    Role[]
  priority      Priority
  publishedAt   DateTime @default(now())
  expiresAt     DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## API Routes Structure

```
/api
├── /auth
│   ├── /register (POST)
│   ├── /login (POST)
│   ├── /logout (POST)
│   └── /session (GET)
│
├── /students
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   ├── /[id]/attendance (GET)
│   ├── /[id]/grades (GET)
│   └── /[id]/homework (GET)
│
├── /teachers
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   └── /[id]/classes (GET)
│
├── /classes
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   ├── /[id]/students (GET)
│   └── /[id]/attendance (GET, POST)
│
├── /attendance
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   ├── /bulk (POST)
│   └── /analytics (GET)
│
├── /homework
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   ├── /[id]/submissions (GET)
│   └── /submit (POST)
│
├── /grades
│   ├── / (GET, POST)
│   ├── /[id] (GET, PUT, DELETE)
│   ├── /student/[studentId] (GET)
│   └── /analytics (GET)
│
├── /fees
│   ├── /structure (GET, POST)
│   ├── /payments (GET, POST)
│   ├── /payments/[id] (GET)
│   └── /student/[studentId]/balance (GET)
│
└── /announcements
    ├── / (GET, POST)
    ├── /[id] (GET, PUT, DELETE)
    └── /active (GET)
```

## Authentication Flow

### Registration
1. User submits registration form
2. Validate input with Zod
3. Hash password with bcrypt
4. Create User record
5. Create role-specific record (Student/Teacher/Parent/Admin)
6. Return success response

### Login
1. User submits credentials
2. Find user by email
3. Verify password with bcrypt
4. Generate JWT token
5. Set secure HTTP-only cookie
6. Return user data (without password)

### Authorization Middleware
```typescript
export async function requireAuth(req: Request, allowedRoles: Role[]) {
  const session = await getSession(req)
  
  if (!session) {
    throw new UnauthorizedError()
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError()
  }
  
  return session.user
}
```

## Data Validation

Using Zod schemas for all API inputs:

```typescript
// Example: Student creation schema
const createStudentSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  rollNumber: z.string().regex(/^[0-9]{3,6}$/),
  classId: z.string().cuid(),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(10),
  phone: z.string().regex(/^\+233[0-9]{9}$/).optional(),
  parentId: z.string().cuid().optional(),
})
```

## Error Handling

Centralized error handling:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`)
  }
}

export class ValidationError extends AppError {
  constructor(errors: any) {
    super(400, 'Validation failed', errors)
  }
}
```

## Real-time Updates

Using Server-Sent Events (SSE) for real-time notifications:

```typescript
// /api/events/[userId]
export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // Send updates when data changes
      const interval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

## Database Migrations

Prisma migration workflow:
1. Update schema.prisma
2. Run `npx prisma migrate dev --name description`
3. Prisma generates SQL migration
4. Apply to database
5. Regenerate Prisma Client

## Seed Data

Create seed script for development:

```typescript
// prisma/seed.ts
async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: await hash('Admin123!'),
      fullName: 'System Administrator',
      role: 'ADMIN',
      admin: {
        create: {
          department: 'Administration'
        }
      }
    }
  })
  
  // Create sample classes, students, teachers, etc.
}
```

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Query Optimization**: Use Prisma's `select` and `include` wisely
3. **Caching**: Implement Redis for frequently accessed data
4. **Pagination**: Implement cursor-based pagination for large datasets
5. **Connection Pooling**: Configure Prisma connection pool

## Security Measures

1. **SQL Injection**: Prevented by Prisma's parameterized queries
2. **XSS**: Sanitize all user inputs
3. **CSRF**: Use CSRF tokens for state-changing operations
4. **Rate Limiting**: Implement rate limiting on API routes
5. **Input Validation**: Validate all inputs with Zod
6. **Password Security**: Use bcrypt with salt rounds >= 10
7. **JWT Security**: Use secure, HTTP-only cookies

## Deployment Considerations

1. **Environment Variables**: Store sensitive data in .env
2. **Database Backups**: Automated daily backups
3. **Monitoring**: Set up error tracking (Sentry)
4. **Logging**: Implement structured logging
5. **CI/CD**: Automated testing and deployment

## Testing Strategy

1. **Unit Tests**: Test individual functions and utilities
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete user flows
4. **Database Tests**: Test with test database
5. **Load Tests**: Test performance under load
