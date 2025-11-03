-- ============================================
-- TASK 2.2: CREATE ASSESSMENT AND GRADING TABLES
-- ============================================
-- This script creates assessment and grading tables with constraints
-- and validation rules for grade calculations
-- Requirements: 3.2, 3.3, 4.2, 4.3

-- ============================================
-- 1. CREATE ASSESSMENT TABLES
-- ============================================

-- Assessments table: Stores assessment definitions
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'assignment', 'project')),
  title TEXT NOT NULL,
  description TEXT,
  max_score DECIMAL(5,2) NOT NULL CHECK (max_score > 0),
  weight DECIMAL(5,2) DEFAULT 1.0 CHECK (weight > 0),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure valid assessment configuration
  CONSTRAINT valid_max_score CHECK (max_score > 0),
  CONSTRAINT valid_weight CHECK (weight > 0 AND weight <= 100)
);

-- Assessment scores table: Stores individual student scores
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  remarks TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one score per student per assessment
  UNIQUE(assessment_id, student_id),
  
  -- Ensure score is non-negative
  CONSTRAINT valid_score CHECK (score >= 0)
);

-- Report cards table: Stores consolidated term reports
CREATE TABLE IF NOT EXISTS report_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  overall_grade TEXT,
  overall_percentage DECIMAL(5,2) CHECK (overall_percentage >= 0 AND overall_percentage <= 100),
  class_rank INTEGER,
  total_students INTEGER,
  teacher_remarks TEXT,
  head_teacher_remarks TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one report card per student per term
  UNIQUE(student_id, term_id),
  
  -- Ensure valid percentage range
  CONSTRAINT valid_percentage CHECK (overall_percentage >= 0 AND overall_percentage <= 100),
  
  -- Ensure valid ranking
  CONSTRAINT valid_rank CHECK (class_rank > 0 AND class_rank <= total_students)
);

-- ============================================
-- 2. CREATE GRADE CALCULATION FUNCTIONS
-- ============================================

-- Function: Calculate grade based on Ghana Education Service standards
CREATE OR REPLACE FUNCTION calculate_grade(percentage DECIMAL)
RETURNS TEXT AS $$
BEGIN
  -- Ghana Education Service grading system
  IF percentage >= 80 THEN RETURN 'A (Excellent)';
  ELSIF percentage >= 70 THEN RETURN 'B (Very Good)';
  ELSIF percentage >= 60 THEN RETURN 'C (Good)';
  ELSIF percentage >= 50 THEN RETURN 'D (Credit)';
  ELSIF percentage >= 40 THEN RETURN 'E (Pass)';
  ELSE RETURN 'F (Fail)';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate student's overall percentage for a term
CREATE OR REPLACE FUNCTION calculate_student_overall_percentage(
  p_student_id UUID,
  p_term_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_weighted_score DECIMAL := 0;
  v_total_weight DECIMAL := 0;
  v_percentage DECIMAL;
BEGIN
  -- Calculate weighted average across all subjects for the term
  SELECT 
    COALESCE(SUM((asc.score / a.max_score) * 100 * a.weight), 0),
    COALESCE(SUM(a.weight), 0)
  INTO v_total_weighted_score, v_total_weight
  FROM assessment_scores asc
  JOIN assessments a ON a.id = asc.assessment_id
  JOIN subject_assignments sa ON sa.id = a.subject_assignment_id
  JOIN class_enrollments ce ON ce.class_id = sa.class_id
  WHERE asc.student_id = p_student_id
    AND a.term_id = p_term_id
    AND ce.student_id = p_student_id
    AND ce.status = 'active';
  
  -- Calculate percentage
  IF v_total_weight > 0 THEN
    v_percentage := v_total_weighted_score / v_total_weight;
  ELSE
    v_percentage := 0;
  END IF;
  
  RETURN ROUND(v_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate student's rank in their class for a term
CREATE OR REPLACE FUNCTION calculate_student_rank(
  p_student_id UUID,
  p_term_id UUID
)
RETURNS TABLE(rank INTEGER, total_students INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH student_percentages AS (
    SELECT 
      rc.student_id,
      rc.overall_percentage,
      ROW_NUMBER() OVER (ORDER BY rc.overall_percentage DESC) as student_rank
    FROM report_cards rc
    JOIN students s ON s.id = rc.student_id
    JOIN class_enrollments ce ON ce.student_id = s.id
    WHERE rc.term_id = p_term_id
      AND ce.status = 'active'
      AND ce.class_id = (
        SELECT class_id FROM class_enrollments 
        WHERE student_id = p_student_id AND status = 'active' 
        LIMIT 1
      )
  )
  SELECT 
    sp.student_rank::INTEGER,
    COUNT(*)::INTEGER OVER () as total
  FROM student_percentages sp
  WHERE sp.student_id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE VALIDATION FUNCTIONS
-- ============================================

-- Function: Validate assessment score against max score
CREATE OR REPLACE FUNCTION validate_assessment_score()
RETURNS TRIGGER AS $$
DECLARE
  v_max_score DECIMAL;
BEGIN
  -- Get max score for the assessment
  SELECT max_score INTO v_max_score
  FROM assessments
  WHERE id = NEW.assessment_id;
  
  -- Validate score is non-negative
  IF NEW.score < 0 THEN
    RAISE EXCEPTION 'Score cannot be negative';
  END IF;
  
  -- Validate score doesn't exceed max
  IF NEW.score > v_max_score THEN
    RAISE EXCEPTION 'Score (%) cannot exceed maximum score (%)', NEW.score, v_max_score;
  END IF;
  
  -- Set graded_at timestamp if not set
  IF NEW.graded_at IS NULL THEN
    NEW.graded_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE AUTOMATIC UPDATE FUNCTIONS
-- ============================================

-- Function: Automatically update report card when scores change
CREATE OR REPLACE FUNCTION update_report_card_on_score_change()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
  v_term_id UUID;
  v_percentage DECIMAL;
  v_grade TEXT;
  v_rank INTEGER;
  v_total INTEGER;
BEGIN
  -- Get student and term from the assessment
  SELECT asc.student_id, a.term_id
  INTO v_student_id, v_term_id
  FROM assessment_scores asc
  JOIN assessments a ON a.id = asc.assessment_id
  WHERE asc.id = NEW.id;
  
  -- Calculate new percentage
  v_percentage := calculate_student_overall_percentage(v_student_id, v_term_id);
  v_grade := calculate_grade(v_percentage);
  
  -- Update or insert report card (without rank for now)
  INSERT INTO report_cards (student_id, term_id, overall_percentage, overall_grade)
  VALUES (v_student_id, v_term_id, v_percentage, v_grade)
  ON CONFLICT (student_id, term_id) 
  DO UPDATE SET 
    overall_percentage = v_percentage,
    overall_grade = v_grade,
    updated_at = NOW();
  
  -- Calculate and update rank
  SELECT rank, total_students INTO v_rank, v_total
  FROM calculate_student_rank(v_student_id, v_term_id);
  
  IF v_rank IS NOT NULL THEN
    UPDATE report_cards
    SET class_rank = v_rank, total_students = v_total
    WHERE student_id = v_student_id AND term_id = v_term_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE TRIGGERS
-- ============================================

-- Trigger: Validate scores before insert/update
DROP TRIGGER IF EXISTS trigger_validate_score ON assessment_scores;
CREATE TRIGGER trigger_validate_score
BEFORE INSERT OR UPDATE OF score ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION validate_assessment_score();

-- Trigger: Update report cards when scores change
DROP TRIGGER IF EXISTS trigger_update_report_card ON assessment_scores;
CREATE TRIGGER trigger_update_report_card
AFTER INSERT OR UPDATE OF score ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION update_report_card_on_score_change();

-- Trigger: Update updated_at timestamp on assessments
DROP TRIGGER IF EXISTS trigger_assessments_updated_at ON assessments;
CREATE TRIGGER trigger_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at timestamp on assessment_scores
DROP TRIGGER IF EXISTS trigger_assessment_scores_updated_at ON assessment_scores;
CREATE TRIGGER trigger_assessment_scores_updated_at
BEFORE UPDATE ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at timestamp on report_cards
DROP TRIGGER IF EXISTS trigger_report_cards_updated_at ON report_cards;
CREATE TRIGGER trigger_report_cards_updated_at
BEFORE UPDATE ON report_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for assessments
CREATE INDEX IF NOT EXISTS idx_assessments_subject_assignment 
ON assessments(subject_assignment_id);

CREATE INDEX IF NOT EXISTS idx_assessments_term 
ON assessments(term_id);

CREATE INDEX IF NOT EXISTS idx_assessments_type 
ON assessments(assessment_type);

-- Indexes for assessment_scores
CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment 
ON assessment_scores(assessment_id);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_student 
ON assessment_scores(student_id);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment_student 
ON assessment_scores(assessment_id, student_id);

-- Indexes for report_cards
CREATE INDEX IF NOT EXISTS idx_report_cards_student 
ON report_cards(student_id);

CREATE INDEX IF NOT EXISTS idx_report_cards_term 
ON report_cards(term_id);

CREATE INDEX IF NOT EXISTS idx_report_cards_student_term 
ON report_cards(student_id, term_id);

CREATE INDEX IF NOT EXISTS idx_report_cards_percentage 
ON report_cards(overall_percentage DESC);

-- ============================================
-- 7. ADD TABLE COMMENTS
-- ============================================

COMMENT ON TABLE assessments IS 
'Stores assessment definitions including tests, exams, assignments, and projects with scoring configuration';

COMMENT ON TABLE assessment_scores IS 
'Stores individual student scores for each assessment with validation against max scores';

COMMENT ON TABLE report_cards IS 
'Stores consolidated report cards for students per term with automatic grade calculation and ranking';

COMMENT ON COLUMN assessments.weight IS 
'Weight of this assessment in overall grade calculation (default 1.0)';

COMMENT ON COLUMN assessments.max_score IS 
'Maximum possible score for this assessment';

COMMENT ON COLUMN assessment_scores.score IS 
'Student score for this assessment (must be between 0 and max_score)';

COMMENT ON COLUMN report_cards.overall_percentage IS 
'Automatically calculated weighted average percentage across all subjects';

COMMENT ON COLUMN report_cards.overall_grade IS 
'Ghana Education Service grade classification (A-F) based on percentage';

COMMENT ON COLUMN report_cards.class_rank IS 
'Student rank within their class for this term';

-- ============================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. CREATE RLS POLICIES
-- ============================================

-- Assessments policies
CREATE POLICY "Teachers can manage own assessments" ON assessments 
FOR ALL USING (
  subject_assignment_id IN (
    SELECT id FROM subject_assignments WHERE teacher_id IN (
      SELECT id FROM teachers WHERE profile_id = auth.uid()
    )
  )
);

CREATE POLICY "Students can view assessments for their classes" ON assessments 
FOR SELECT USING (
  subject_assignment_id IN (
    SELECT sa.id FROM subject_assignments sa
    JOIN class_enrollments ce ON ce.class_id = sa.class_id
    JOIN students s ON s.id = ce.student_id
    WHERE s.profile_id = auth.uid() AND ce.status = 'active'
  )
);

CREATE POLICY "Admins can manage all assessments" ON assessments 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assessment scores policies
CREATE POLICY "Teachers can manage scores for their assessments" ON assessment_scores 
FOR ALL USING (
  assessment_id IN (
    SELECT a.id FROM assessments a
    JOIN subject_assignments sa ON sa.id = a.subject_assignment_id
    JOIN teachers t ON t.id = sa.teacher_id
    WHERE t.profile_id = auth.uid()
  )
);

CREATE POLICY "Students can view own scores" ON assessment_scores 
FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

CREATE POLICY "Parents can view children scores" ON assessment_scores 
FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all scores" ON assessment_scores 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Report cards policies
CREATE POLICY "Students can view own report cards" ON report_cards 
FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

CREATE POLICY "Parents can view children report cards" ON report_cards 
FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);

CREATE POLICY "Teachers can view report cards for their students" ON report_cards 
FOR SELECT USING (
  student_id IN (
    SELECT DISTINCT ce.student_id 
    FROM class_enrollments ce
    JOIN subject_assignments sa ON sa.class_id = ce.class_id
    JOIN teachers t ON t.id = sa.teacher_id
    WHERE t.profile_id = auth.uid() AND ce.status = 'active'
  )
);

CREATE POLICY "Teachers can update report card remarks" ON report_cards 
FOR UPDATE USING (
  student_id IN (
    SELECT DISTINCT ce.student_id 
    FROM class_enrollments ce
    JOIN subject_assignments sa ON sa.class_id = ce.class_id
    JOIN teachers t ON t.id = sa.teacher_id
    WHERE t.profile_id = auth.uid() AND ce.status = 'active'
  )
);

CREATE POLICY "Admins can manage all report cards" ON report_cards 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- TASK 2.2 COMPLETE!
-- ============================================

SELECT 'Task 2.2 Complete: Assessment and grading tables created with constraints and validation rules!' AS message;
