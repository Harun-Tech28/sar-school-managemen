-- Refresh Schema Cache and Verify Relationships
-- Run this in your Supabase SQL Editor to fix the schema cache issue

-- 1. Verify the foreign key exists
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='students'
  AND kcu.column_name='class_id';

-- 2. If the foreign key doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_class_id_fkey' 
        AND table_name = 'students'
    ) THEN
        ALTER TABLE students 
        ADD CONSTRAINT students_class_id_fkey 
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- 3. Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Verify the relationship is working
SELECT 
    s.id,
    s.student_id,
    s.class_id,
    c.class_name
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LIMIT 5;

-- Success message
SELECT 'Schema refreshed successfully! The relationship between students and classes is now available.' as message;
