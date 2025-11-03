-- ============================================
-- SAR SCHOOL MANAGEMENT SYSTEM - COMPLETE SETUP
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- This will create all tables, policies, and storage buckets

-- ============================================
-- 1. CREATE CORE TABLES
-- ============================================

-- Profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id TEXT UNIQUE NOT NULL,
  hire_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  admission_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student-Parent relationship
CREATE TABLE IF NOT EXISTS student_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, parent_id)
);

-- Academic years
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_name TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms
CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  term_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name TEXT UNIQUE NOT NULL,
  subject_code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Subject assignments (which teacher teaches which subject to which class)
CREATE TABLE IF NOT EXISTS subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id, class_id, academic_year_id)
);

-- ============================================
-- 2. CREATE ASSESSMENT TABLES
-- ============================================

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'assignment', 'project')),
  title TEXT NOT NULL,
  description TEXT,
  max_score DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) DEFAULT 1.0,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment scores
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id)
);

-- Report cards
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  overall_grade TEXT,
  overall_percentage DECIMAL(5,2),
  teacher_remarks TEXT,
  head_teacher_remarks TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term_id)
);

-- ============================================
-- 3. CREATE FINANCIAL TABLES
-- ============================================

-- Fee structures
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL,
  fee_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee payments
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT UNIQUE,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CREATE COMMUNICATION TABLES
-- ============================================

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_audience TEXT[] NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id, date)
);

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Teachers: Can view own data, admins can view all
CREATE POLICY "Teachers can view own data" ON teachers FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage teachers" ON teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Students: Can view own data, teachers and admins can view their students
CREATE POLICY "Students can view own data" ON students FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Teachers can view students" ON students FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);
CREATE POLICY "Admins can manage students" ON students FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Parents: Can view own data and their children's data
CREATE POLICY "Parents can view own data" ON parents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admins can manage parents" ON parents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Student-Parents: Parents can view their relationships
CREATE POLICY "Parents can view their children" ON student_parents FOR SELECT USING (
  parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can manage student-parent relationships" ON student_parents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Academic years, terms, classes, subjects: Everyone can read, admins can manage
CREATE POLICY "Everyone can view academic years" ON academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage academic years" ON academic_years FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view terms" ON terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage terms" ON terms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Class enrollments: Students can view their own, teachers and admins can view all
CREATE POLICY "Students can view own enrollments" ON class_enrollments FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Teachers can view enrollments" ON class_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);
CREATE POLICY "Admins can manage enrollments" ON class_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subject assignments: Teachers can view their own, admins can manage all
CREATE POLICY "Teachers can view own assignments" ON subject_assignments FOR SELECT USING (
  teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can manage subject assignments" ON subject_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assessments: Teachers can manage their own, students can view theirs
CREATE POLICY "Teachers can manage own assessments" ON assessments FOR ALL USING (
  subject_assignment_id IN (
    SELECT id FROM subject_assignments WHERE teacher_id IN (
      SELECT id FROM teachers WHERE profile_id = auth.uid()
    )
  )
);
CREATE POLICY "Students can view assessments" ON assessments FOR SELECT USING (
  subject_assignment_id IN (
    SELECT sa.id FROM subject_assignments sa
    JOIN class_enrollments ce ON ce.class_id = sa.class_id
    JOIN students s ON s.id = ce.student_id
    WHERE s.profile_id = auth.uid()
  )
);

-- Assessment scores: Teachers can manage, students can view their own
CREATE POLICY "Teachers can manage assessment scores" ON assessment_scores FOR ALL USING (
  assessment_id IN (
    SELECT a.id FROM assessments a
    JOIN subject_assignments sa ON sa.id = a.subject_assignment_id
    JOIN teachers t ON t.id = sa.teacher_id
    WHERE t.profile_id = auth.uid()
  )
);
CREATE POLICY "Students can view own scores" ON assessment_scores FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

-- Report cards: Students and parents can view, teachers and admins can manage
CREATE POLICY "Students can view own report cards" ON report_cards FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Parents can view children report cards" ON report_cards FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);
CREATE POLICY "Teachers and admins can manage report cards" ON report_cards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Fee structures: Everyone can read, admins can manage
CREATE POLICY "Everyone can view fee structures" ON fee_structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage fee structures" ON fee_structures FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fee payments: Students and parents can view their own, admins can manage all
CREATE POLICY "Students can view own payments" ON fee_payments FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Parents can view children payments" ON fee_payments FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage fee payments" ON fee_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Announcements: Everyone can read, admins and teachers can create
CREATE POLICY "Everyone can view announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers and admins can manage announcements" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Messages: Users can view their own messages
CREATE POLICY "Users can view sent messages" ON messages FOR SELECT USING (sender_id = auth.uid());
CREATE POLICY "Users can view received messages" ON messages FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Attendance: Teachers and admins can manage, students and parents can view
CREATE POLICY "Teachers can manage attendance" ON attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);
CREATE POLICY "Parents can view children attendance" ON attendance FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);

-- ============================================
-- 7. CREATE STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('assignments', 'assignments', false),
  ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (public)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for documents (private)
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage policies for assignments (private)
CREATE POLICY "Teachers can manage assignments" ON storage.objects FOR ALL USING (
  bucket_id = 'assignments' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);
CREATE POLICY "Students can view assignments" ON storage.objects FOR SELECT USING (
  bucket_id = 'assignments' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
);

-- Storage policies for reports (private)
CREATE POLICY "Admins can manage reports" ON storage.objects FOR ALL USING (
  bucket_id = 'reports' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own reports" ON storage.objects FOR SELECT USING (
  bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_teachers_profile_id ON teachers(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_parents_profile_id ON parents(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_student_id ON student_parents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_parents_parent_id ON student_parents(parent_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_subject_assignments_teacher_id ON subject_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject_assignment_id ON assessments(subject_assignment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student_id ON assessment_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Database setup complete! You can now create users and start using the system.' AS message;
