-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get teacher ID for current user
CREATE OR REPLACE FUNCTION get_teacher_id()
RETURNS UUID AS $$
  SELECT id FROM teachers WHERE profile_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get student ID for current user
CREATE OR REPLACE FUNCTION get_student_id()
RETURNS UUID AS $$
  SELECT id FROM students WHERE profile_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is parent of a student
CREATE OR REPLACE FUNCTION is_parent_of(student_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM student_parents sp
    JOIN parents p ON sp.parent_id = p.id
    WHERE p.profile_id = auth.uid() AND sp.student_id = student_uuid
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Teachers can view other teachers and students in their classes
CREATE POLICY "Teachers can view relevant profiles"
  ON profiles FOR SELECT
  USING (
    is_teacher() AND (
      role IN ('teacher', 'student') OR
      id IN (
        SELECT s.profile_id FROM students s
        JOIN class_subjects cs ON s.class_id = cs.class_id
        WHERE cs.teacher_id = get_teacher_id()
      )
    )
  );

-- Students can view teachers and other students in their class
CREATE POLICY "Students can view class profiles"
  ON profiles FOR SELECT
  USING (
    role = 'student' AND id IN (
      SELECT p2.id FROM profiles p2
      JOIN students s2 ON p2.id = s2.profile_id
      WHERE s2.class_id = (SELECT class_id FROM students WHERE profile_id = auth.uid())
      UNION
      SELECT p2.id FROM profiles p2
      JOIN teachers t ON p2.id = t.profile_id
      JOIN class_subjects cs ON t.id = cs.teacher_id
      WHERE cs.class_id = (SELECT class_id FROM students WHERE profile_id = auth.uid())
    )
  );

-- Parents can view their children's profiles and teachers
CREATE POLICY "Parents can view children and teachers"
  ON profiles FOR SELECT
  USING (
    role = 'parent' AND id IN (
      SELECT s.profile_id FROM students s
      JOIN student_parents sp ON s.id = sp.student_id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
      UNION
      SELECT t.profile_id FROM teachers t
      JOIN class_subjects cs ON t.id = cs.teacher_id
      JOIN students s ON cs.class_id = s.class_id
      JOIN student_parents sp ON s.id = sp.student_id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ============================================
-- ACADEMIC STRUCTURE POLICIES
-- ============================================

-- Everyone can read academic years, terms, classes, subjects
CREATE POLICY "All authenticated users can view academic years"
  ON academic_years FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view terms"
  ON terms FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view classes"
  ON classes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can view subjects"
  ON subjects FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify academic structure
CREATE POLICY "Admins can manage academic years"
  ON academic_years FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage terms"
  ON terms FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- STUDENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to students"
  ON students FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can view students in their classes"
  ON students FOR SELECT
  USING (
    is_teacher() AND class_id IN (
      SELECT class_id FROM class_subjects WHERE teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  USING (is_parent_of(id));

-- ============================================
-- TEACHERS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to teachers"
  ON teachers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "All authenticated users can view teachers"
  ON teachers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers can update own record"
  ON teachers FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ============================================
-- PARENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to parents"
  ON parents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Parents can view own record"
  ON parents FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Parents can update own record"
  ON parents FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Teachers can view parents of their students"
  ON parents FOR SELECT
  USING (
    is_teacher() AND id IN (
      SELECT sp.parent_id FROM student_parents sp
      JOIN students s ON sp.student_id = s.id
      JOIN class_subjects cs ON s.class_id = cs.class_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  );

-- ============================================
-- STUDENT_PARENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to student_parents"
  ON student_parents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Parents can view own relationships"
  ON student_parents FOR SELECT
  USING (
    parent_id IN (SELECT id FROM parents WHERE profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view student-parent relationships"
  ON student_parents FOR SELECT
  USING (
    is_teacher() AND student_id IN (
      SELECT s.id FROM students s
      JOIN class_subjects cs ON s.class_id = cs.class_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  );

-- ============================================
-- CLASS_SUBJECTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to class_subjects"
  ON class_subjects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "All authenticated users can view class_subjects"
  ON class_subjects FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- TIMETABLE_SLOTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to timetable"
  ON timetable_slots FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "All authenticated users can view timetable"
  ON timetable_slots FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- ATTENDANCE TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to attendance"
  ON attendance FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance FOR ALL
  USING (
    is_teacher() AND student_id IN (
      SELECT s.id FROM students s
      JOIN class_subjects cs ON s.class_id = cs.class_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  )
  WITH CHECK (
    is_teacher() AND student_id IN (
      SELECT s.id FROM students s
      JOIN class_subjects cs ON s.class_id = cs.class_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (student_id = get_student_id());

CREATE POLICY "Parents can view children's attendance"
  ON attendance FOR SELECT
  USING (is_parent_of(student_id));

-- ============================================
-- ASSESSMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to assessments"
  ON assessments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can manage assessments for their classes"
  ON assessments FOR ALL
  USING (
    is_teacher() AND class_id IN (
      SELECT class_id FROM class_subjects WHERE teacher_id = get_teacher_id()
    )
  )
  WITH CHECK (
    is_teacher() AND class_id IN (
      SELECT class_id FROM class_subjects WHERE teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Students can view assessments for their class"
  ON assessments FOR SELECT
  USING (
    class_id = (SELECT class_id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view children's assessments"
  ON assessments FOR SELECT
  USING (
    class_id IN (
      SELECT s.class_id FROM students s
      JOIN student_parents sp ON s.id = sp.student_id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ============================================
-- GRADES TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to grades"
  ON grades FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can manage grades for their assessments"
  ON grades FOR ALL
  USING (
    is_teacher() AND assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN class_subjects cs ON a.class_id = cs.class_id AND a.subject_id = cs.subject_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  )
  WITH CHECK (
    is_teacher() AND assessment_id IN (
      SELECT a.id FROM assessments a
      JOIN class_subjects cs ON a.class_id = cs.class_id AND a.subject_id = cs.subject_id
      WHERE cs.teacher_id = get_teacher_id()
    )
  );

CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  USING (student_id = get_student_id());

CREATE POLICY "Parents can view children's grades"
  ON grades FOR SELECT
  USING (is_parent_of(student_id));

-- Continue in next file due to length...
