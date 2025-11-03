-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on role for faster queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Create academic_years table
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_current_year UNIQUE NULLS NOT DISTINCT (is_current, CASE WHEN is_current THEN TRUE END)
);

CREATE INDEX idx_academic_years_current ON academic_years(is_current) WHERE is_current = TRUE;

-- Create terms table
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  term_name TEXT NOT NULL,
  term_number INTEGER NOT NULL CHECK (term_number IN (1, 2, 3)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_term_per_year UNIQUE(academic_year_id, term_number),
  CONSTRAINT unique_current_term UNIQUE NULLS NOT DISTINCT (is_current, CASE WHEN is_current THEN TRUE END)
);

CREATE INDEX idx_terms_academic_year ON terms(academic_year_id);
CREATE INDEX idx_terms_current ON terms(is_current) WHERE is_current = TRUE;

-- Create classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Creche', 'Nursery', 'KG', 'Primary', 'JHS')),
  grade_number INTEGER,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_class_name UNIQUE(class_name)
);

CREATE INDEX idx_classes_level ON classes(level);

-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_name TEXT NOT NULL,
  subject_code TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(subject_code);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  admission_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_profile ON students(profile_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_status ON students(status);

-- Create teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id TEXT UNIQUE NOT NULL,
  qualification TEXT,
  specialization TEXT,
  hire_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teachers_profile ON teachers(profile_id);
CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX idx_teachers_status ON teachers(status);

-- Create parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  occupation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parents_profile ON parents(profile_id);

-- Create student_parents junction table
CREATE TABLE student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('Father', 'Mother', 'Guardian')),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_parent UNIQUE(student_id, parent_id)
);

CREATE INDEX idx_student_parents_student ON student_parents(student_id);
CREATE INDEX idx_student_parents_parent ON student_parents(parent_id);

-- Create class_subjects table (links classes, subjects, and teachers)
CREATE TABLE class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_class_subject_year UNIQUE(class_id, subject_id, academic_year_id)
);

CREATE INDEX idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject ON class_subjects(subject_id);
CREATE INDEX idx_class_subjects_teacher ON class_subjects(teacher_id);
CREATE INDEX idx_class_subjects_year ON class_subjects(academic_year_id);

-- Create timetable_slots table
CREATE TABLE timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_timetable_class ON timetable_slots(class_id);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_term ON timetable_slots(term_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role-based information';
COMMENT ON TABLE academic_years IS 'Academic year definitions';
COMMENT ON TABLE terms IS 'Academic terms within years (typically 3 per year)';
COMMENT ON TABLE classes IS 'Class/grade definitions following Ghana educational structure';
COMMENT ON TABLE subjects IS 'Subject/course definitions';
COMMENT ON TABLE students IS 'Student records linked to profiles';
COMMENT ON TABLE teachers IS 'Teacher records linked to profiles';
COMMENT ON TABLE parents IS 'Parent/guardian records linked to profiles';
COMMENT ON TABLE student_parents IS 'Many-to-many relationship between students and parents';
COMMENT ON TABLE class_subjects IS 'Assignment of subjects to classes with teachers';
COMMENT ON TABLE timetable_slots IS 'Weekly timetable schedule for classes';
