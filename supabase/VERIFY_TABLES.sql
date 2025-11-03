-- ============================================
-- VERIFY ALL TABLES EXIST
-- ============================================
-- Run this to see which tables you have

SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'teachers', 'students', 'parents', 'student_parents',
            'academic_years', 'terms', 'classes', 'subjects', 'class_enrollments',
            'subject_assignments', 'assessments', 'assessment_scores', 'report_cards',
            'fee_structures', 'fee_payments', 'announcements', 'messages', 'attendance'
        ) THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Count total tables
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List of tables that SHOULD exist:
-- 1. profiles
-- 2. teachers
-- 3. students
-- 4. parents
-- 5. student_parents
-- 6. academic_years
-- 7. terms
-- 8. classes
-- 9. subjects
-- 10. class_enrollments
-- 11. subject_assignments
-- 12. assessments
-- 13. assessment_scores
-- 14. report_cards
-- 15. fee_structures
-- 16. fee_payments
-- 17. announcements
-- 18. messages
-- 19. attendance
