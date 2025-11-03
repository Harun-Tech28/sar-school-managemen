-- ============================================
-- CREATE TEST USERS FOR SAR SCHOOL MANAGEMENT SYSTEM
-- ============================================
-- 
-- IMPORTANT: Before running this script:
-- 1. Create users in Supabase Dashboard > Authentication > Users
-- 2. Replace the UUIDs below with the actual UUIDs from auth.users
-- 3. Run this script in SQL Editor
--
-- Test Credentials (set in Supabase Dashboard):
-- - admin@sarschool.edu.gh / Admin@123
-- - teacher@sarschool.edu.gh / Teacher@123
-- - student@sarschool.edu.gh / Student@123
-- - parent@sarschool.edu.gh / Parent@123
-- ============================================

-- ============================================
-- 1. CREATE ACADEMIC STRUCTURE
-- ============================================

-- Create current academic year
INSERT INTO academic_years (year_name, start_date, end_date, is_current)
VALUES ('2024/2025', '2024-09-01', '2025-08-31', true);

-- Get the academic year ID (you'll need this)
-- SELECT id FROM academic_years WHERE year_name = '2024/2025';

-- Create terms (replace 'academic-year-uuid' with actual UUID from above)
INSERT INTO terms (academic_year_id, term_name, term_number, start_date, end_date, is_current)
VALUES 
  ('academic-year-uuid', 'First Term', 1, '2024-09-01', '2024-12-20', true),
  ('academic-year-uuid', 'Second Term', 2, '2025-01-06', '2025-04-10', false),
  ('academic-year-uuid', 'Third Term', 3, '2025-04-21', '2025-08-31', false);

-- Create classes
INSERT INTO classes (class_name, level, grade_number, capacity)
VALUES 
  ('Creche A', 'Creche', 0, 20),
  ('Nursery 1', 'Nursery', 1, 25),
  ('Nursery 2', 'Nursery', 2, 25),
  ('KG 1', 'KG', 1, 30),
  ('KG 2', 'KG', 2, 30),
  ('Primary 1', 'Primary', 1, 35),
  ('Primary 2', 'Primary', 2, 35),
  ('Primary 3', 'Primary', 3, 35),
  ('Primary 4', 'Primary', 4, 35),
  ('Primary 5', 'Primary', 5, 35),
  ('Primary 6', 'Primary', 6, 35),
  ('JHS 1', 'JHS', 1, 40),
  ('JHS 2', 'JHS', 2, 40),
  ('JHS 3', 'JHS', 3, 40);

-- Create subjects
INSERT INTO subjects (subject_name, subject_code, description)
VALUES 
  ('Mathematics', 'MATH', 'Mathematics and Numeracy'),
  ('English Language', 'ENG', 'English Language and Literacy'),
  ('Science', 'SCI', 'Integrated Science'),
  ('Social Studies', 'SOC', 'Social Studies'),
  ('Religious and Moral Education', 'RME', 'Religious and Moral Education'),
  ('Ghanaian Language', 'GHA', 'Ghanaian Language (Twi)'),
  ('Creative Arts', 'ART', 'Creative Arts and Design'),
  ('Physical Education', 'PE', 'Physical Education and Sports'),
  ('ICT', 'ICT', 'Information and Communication Technology'),
  ('French', 'FRE', 'French Language');

-- ============================================
-- 2. CREATE ADMIN USER
-- ============================================

-- STEP 1: Create user in Supabase Dashboard first!
-- Email: admin@sarschool.edu.gh
-- Password: Admin@123

-- STEP 2: Replace 'admin-auth-uuid' with the UUID from auth.users
INSERT INTO profiles (id, email, role, first_name, last_name, phone, address)
VALUES (
  'admin-auth-uuid',
  'admin@sarschool.edu.gh',
  'admin',
  'System',
  'Administrator',
  '+233 24 123 4567',
  'SAR Educational Complex, Sepe Dote, Kumasi'
);

-- ============================================
-- 3. CREATE TEACHER USER
-- ============================================

-- STEP 1: Create user in Supabase Dashboard first!
-- Email: teacher@sarschool.edu.gh
-- Password: Teacher@123

-- STEP 2: Replace 'teacher-auth-uuid' with the UUID from auth.users
INSERT INTO profiles (id, email, role, first_name, last_name, phone)
VALUES (
  'teacher-auth-uuid',
  'teacher@sarschool.edu.gh',
  'teacher',
  'John',
  'Mensah',
  '+233 24 234 5678'
);

-- STEP 3: Create teacher record (replace 'teacher-auth-uuid')
INSERT INTO teachers (profile_id, teacher_id, qualification, specialization, hire_date, status)
VALUES (
  'teacher-auth-uuid',
  'T001',
  'Bachelor of Education',
  'Mathematics',
  '2024-01-01',
  'active'
);

-- Assign teacher to a class and subject (replace UUIDs)
-- Get class ID: SELECT id FROM classes WHERE class_name = 'Primary 6';
-- Get subject ID: SELECT id FROM subjects WHERE subject_code = 'MATH';
-- Get teacher ID: SELECT id FROM teachers WHERE teacher_id = 'T001';
-- Get academic year ID: SELECT id FROM academic_years WHERE is_current = true;

INSERT INTO class_subjects (class_id, subject_id, teacher_id, academic_year_id)
VALUES (
  'primary-6-class-uuid',
  'math-subject-uuid',
  'teacher-uuid',
  'academic-year-uuid'
);

-- ============================================
-- 4. CREATE STUDENT USER
-- ============================================

-- STEP 1: Create user in Supabase Dashboard first!
-- Email: student@sarschool.edu.gh
-- Password: Student@123

-- STEP 2: Replace 'student-auth-uuid' with the UUID from auth.users
INSERT INTO profiles (id, email, role, first_name, last_name)
VALUES (
  'student-auth-uuid',
  'student@sarschool.edu.gh',
  'student',
  'Kwame',
  'Asante'
);

-- STEP 3: Create student record (replace UUIDs)
-- Get class ID: SELECT id FROM classes WHERE class_name = 'Primary 6';
INSERT INTO students (profile_id, student_id, class_id, date_of_birth, gender, admission_date, status)
VALUES (
  'student-auth-uuid',
  'S001',
  'primary-6-class-uuid',
  '2012-05-15',
  'Male',
  '2024-01-01',
  'active'
);

-- ============================================
-- 5. CREATE PARENT USER
-- ============================================

-- STEP 1: Create user in Supabase Dashboard first!
-- Email: parent@sarschool.edu.gh
-- Password: Parent@123

-- STEP 2: Replace 'parent-auth-uuid' with the UUID from auth.users
INSERT INTO profiles (id, email, role, first_name, last_name, phone)
VALUES (
  'parent-auth-uuid',
  'parent@sarschool.edu.gh',
  'parent',
  'Akosua',
  'Asante',
  '+233 24 345 6789'
);

-- STEP 3: Create parent record
INSERT INTO parents (profile_id, occupation)
VALUES (
  'parent-auth-uuid',
  'Business Owner'
);

-- STEP 4: Link parent to student (replace UUIDs)
-- Get student ID: SELECT id FROM students WHERE student_id = 'S001';
-- Get parent ID: SELECT id FROM parents WHERE profile_id = 'parent-auth-uuid';
INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
VALUES (
  'student-uuid',
  'parent-uuid',
  'Mother',
  true
);

-- ============================================
-- 6. CREATE SAMPLE DATA (OPTIONAL)
-- ============================================

-- Sample attendance record
INSERT INTO attendance (student_id, class_id, date, status, marked_by)
VALUES (
  'student-uuid',
  'primary-6-class-uuid',
  CURRENT_DATE,
  'present',
  'teacher-uuid'
);

-- Sample assessment
INSERT INTO assessments (class_id, subject_id, term_id, assessment_type, assessment_name, total_marks, date, created_by)
VALUES (
  'primary-6-class-uuid',
  'math-subject-uuid',
  'first-term-uuid',
  'test',
  'Mid-Term Mathematics Test',
  100,
  CURRENT_DATE,
  'teacher-uuid'
);

-- Sample grade (replace assessment-uuid with ID from above)
INSERT INTO grades (assessment_id, student_id, score, remarks, recorded_by)
VALUES (
  'assessment-uuid',
  'student-uuid',
  85,
  'Excellent performance',
  'teacher-uuid'
);

-- Sample announcement
INSERT INTO announcements (title, content, target_audience, created_by, priority)
VALUES (
  'Welcome to SAR Educational Complex',
  'Welcome to the new academic year 2024/2025. We wish all students success in their studies.',
  ARRAY['all'],
  'admin-auth-uuid',
  'normal'
);

-- Sample fee structure
INSERT INTO fee_structures (class_id, academic_year_id, term_id, fee_type, amount, description)
VALUES (
  'primary-6-class-uuid',
  'academic-year-uuid',
  'first-term-uuid',
  'Tuition',
  500.00,
  'First Term Tuition Fee'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all profiles
SELECT id, email, role, first_name, last_name FROM profiles;

-- Check teachers
SELECT t.teacher_id, p.first_name, p.last_name, t.status
FROM teachers t
JOIN profiles p ON t.profile_id = p.id;

-- Check students
SELECT s.student_id, p.first_name, p.last_name, c.class_name, s.status
FROM students s
JOIN profiles p ON s.profile_id = p.id
LEFT JOIN classes c ON s.class_id = c.id;

-- Check parents and their children
SELECT 
  pp.first_name || ' ' || pp.last_name as parent_name,
  sp.relationship,
  ps.first_name || ' ' || ps.last_name as student_name
FROM student_parents sp
JOIN parents par ON sp.parent_id = par.id
JOIN profiles pp ON par.profile_id = pp.id
JOIN students s ON sp.student_id = s.id
JOIN profiles ps ON s.profile_id = ps.id;

-- Check class assignments
SELECT 
  c.class_name,
  sub.subject_name,
  p.first_name || ' ' || p.last_name as teacher_name
FROM class_subjects cs
JOIN classes c ON cs.class_id = c.id
JOIN subjects sub ON cs.subject_id = sub.id
JOIN teachers t ON cs.teacher_id = t.id
JOIN profiles p ON t.profile_id = p.id;

-- ============================================
-- NOTES
-- ============================================
-- 
-- After running this script:
-- 1. Test login with each user type
-- 2. Verify role-based routing works
-- 3. Check that RLS policies allow appropriate access
-- 4. Create additional users as needed
--
-- Remember to replace all 'uuid' placeholders with actual UUIDs!
-- ============================================
