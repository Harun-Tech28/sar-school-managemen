-- ============================================
-- ASSESSMENT AND GRADING CONSTRAINTS
-- ============================================
-- Additional constraints and validation rules for assessment tables

-- Add check constraints for assessment scores
ALTER TABLE assessment_scores 
ADD CONSTRAINT check_score_range 
CHECK (score >= 0 AND score <= (SELECT max_score FROM assessments WHERE id = assessment_id));

-- Add check constraint for report card percentages
ALTER TABLE report_cards 
ADD CONSTRAINT check_percentage_range 
CHECK (overall_percentage >= 0 AND overall_percentage <= 100);

-- Add check constraint for assessment weights
ALTER TABLE assessments 
ADD CONSTRAINT check_weight_positive 
CHECK (weight > 0);

-- Add check constraint for max score
ALTER TABLE assessments 
ADD CONSTRAINT check_max_score_positive 
CHECK (max_score > 0);

-- Create function to calculate overall grade based on percentage
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

-- Create function to automatically calculate overall percentage for report cards
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

-- Create function to update report card when assessment scores change
CREATE OR REPLACE FUNCTION update_report_card_on_score_change()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id UUID;
  v_term_id UUID;
  v_percentage DECIMAL;
  v_grade TEXT;
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
  
  -- Update or insert report card
  INSERT INTO report_cards (student_id, term_id, overall_percentage, overall_grade)
  VALUES (v_student_id, v_term_id, v_percentage, v_grade)
  ON CONFLICT (student_id, term_id) 
  DO UPDATE SET 
    overall_percentage = v_percentage,
    overall_grade = v_grade,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update report cards
DROP TRIGGER IF EXISTS trigger_update_report_card ON assessment_scores;
CREATE TRIGGER trigger_update_report_card
AFTER INSERT OR UPDATE OF score ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION update_report_card_on_score_change();

-- Create function to validate assessment score against max score
CREATE OR REPLACE FUNCTION validate_assessment_score()
RETURNS TRIGGER AS $$
DECLARE
  v_max_score DECIMAL;
BEGIN
  -- Get max score for the assessment
  SELECT max_score INTO v_max_score
  FROM assessments
  WHERE id = NEW.assessment_id;
  
  -- Validate score
  IF NEW.score < 0 THEN
    RAISE EXCEPTION 'Score cannot be negative';
  END IF;
  
  IF NEW.score > v_max_score THEN
    RAISE EXCEPTION 'Score (%) cannot exceed maximum score (%)', NEW.score, v_max_score;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate scores before insert/update
DROP TRIGGER IF EXISTS trigger_validate_score ON assessment_scores;
CREATE TRIGGER trigger_validate_score
BEFORE INSERT OR UPDATE OF score ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION validate_assessment_score();

-- Create index for faster grade calculations
CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment_student 
ON assessment_scores(assessment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_assessments_term_id 
ON assessments(term_id);

CREATE INDEX IF NOT EXISTS idx_report_cards_student_term 
ON report_cards(student_id, term_id);

-- Add comment to tables
COMMENT ON TABLE assessments IS 'Stores assessment definitions including tests, exams, and assignments';
COMMENT ON TABLE assessment_scores IS 'Stores individual student scores for each assessment';
COMMENT ON TABLE report_cards IS 'Stores consolidated report cards for students per term';

COMMENT ON FUNCTION calculate_grade(DECIMAL) IS 'Converts percentage to Ghana Education Service grade classification';
COMMENT ON FUNCTION calculate_student_overall_percentage(UUID, UUID) IS 'Calculates weighted average percentage for a student in a term';
COMMENT ON FUNCTION update_report_card_on_score_change() IS 'Automatically updates report card when assessment scores change';
COMMENT ON FUNCTION validate_assessment_score() IS 'Validates that assessment scores are within valid range';

SELECT 'Assessment constraints and validation rules created successfully!' AS message;
