-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Create assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('class_work', 'homework', 'test', 'exam')),
  assessment_name TEXT NOT NULL,
  total_marks DECIMAL NOT NULL CHECK (total_marks > 0),
  date DATE NOT NULL,
  created_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_class ON assessments(class_id);
CREATE INDEX idx_assessments_subject ON assessments(subject_id);
CREATE INDEX idx_assessments_term ON assessments(term_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);
CREATE INDEX idx_assessments_date ON assessments(date);

-- Create grades table
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL CHECK (score >= 0),
  remarks TEXT,
  recorded_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_assessment_student UNIQUE(assessment_id, student_id)
);

CREATE INDEX idx_grades_assessment ON grades(assessment_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_recorded_by ON grades(recorded_by);

-- Add constraint to ensure score doesn't exceed total marks
-- This will be enforced at application level for flexibility

-- Add comments
COMMENT ON TABLE attendance IS 'Daily attendance records for students';
COMMENT ON TABLE assessments IS 'Assessment definitions (tests, exams, homework, etc.)';
COMMENT ON TABLE grades IS 'Student scores for assessments';
