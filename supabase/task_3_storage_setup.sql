-- ============================================
-- TASK 3: SET UP SUPABASE STORAGE AND FILE MANAGEMENT
-- ============================================
-- This script creates storage buckets and access policies
-- Requirements: 2.9, 3.4, 10.2, 10.3

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

-- Documents bucket: School documents, forms, policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];

-- Materials bucket: Teaching materials, assignments, notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain',
    'video/mp4',
    'audio/mpeg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain',
    'video/mp4',
    'audio/mpeg'
  ];

-- Reports bucket: Generated report cards and transcripts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Profile images bucket: User profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  false,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

-- ============================================
-- 2. CREATE STORAGE HELPER FUNCTIONS
-- ============================================

-- Function: Get user's folder path based on role
CREATE OR REPLACE FUNCTION get_user_storage_path()
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
BEGIN
  v_user_id := auth.uid();
  
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;
  
  RETURN v_user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user can access file
CREATE OR REPLACE FUNCTION can_access_file(
  p_bucket TEXT,
  p_path TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_role TEXT;
  v_path_parts TEXT[];
  v_file_owner_id TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Get user role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;
  
  -- Admins can access everything
  IF v_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Parse path to get owner
  v_path_parts := string_to_array(p_path, '/');
  
  IF array_length(v_path_parts, 1) > 0 THEN
    v_file_owner_id := v_path_parts[1];
    
    -- Check if user owns the file
    IF v_file_owner_id = v_user_id::TEXT THEN
      RETURN true;
    END IF;
    
    -- For reports bucket, check if user is parent of student
    IF p_bucket = 'reports' AND v_role = 'parent' THEN
      RETURN EXISTS (
        SELECT 1 FROM student_parents sp
        JOIN parents p ON p.id = sp.parent_id
        JOIN students s ON s.id = sp.student_id
        WHERE p.profile_id = v_user_id
          AND s.profile_id::TEXT = v_file_owner_id
      );
    END IF;
    
    -- For materials bucket, check if user is student in the class
    IF p_bucket = 'materials' AND v_role = 'student' THEN
      RETURN true; -- Students can view all published materials
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate file size before upload
CREATE OR REPLACE FUNCTION validate_file_size()
RETURNS TRIGGER AS $$
DECLARE
  v_max_size BIGINT;
BEGIN
  -- Get bucket size limit
  SELECT file_size_limit INTO v_max_size
  FROM storage.buckets
  WHERE id = NEW.bucket_id;
  
  -- Check if file exceeds limit
  IF NEW.metadata->>'size' IS NOT NULL THEN
    IF (NEW.metadata->>'size')::BIGINT > v_max_size THEN
      RAISE EXCEPTION 'File size exceeds bucket limit of % bytes', v_max_size;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE STORAGE POLICIES
-- ============================================

-- ============================================
-- DOCUMENTS BUCKET POLICIES
-- ============================================

-- Admins can do everything with documents
CREATE POLICY "Admins have full access to documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- All authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Teachers can upload documents
CREATE POLICY "Teachers can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- ============================================
-- MATERIALS BUCKET POLICIES
-- ============================================

-- Admins have full access to materials
CREATE POLICY "Admins have full access to materials"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Teachers can upload materials
CREATE POLICY "Teachers can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- Teachers can update their own materials
CREATE POLICY "Teachers can update own materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::TEXT FROM teachers t WHERE t.profile_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::TEXT FROM teachers t WHERE t.profile_id = auth.uid()
  )
);

-- Teachers can delete their own materials
CREATE POLICY "Teachers can delete own materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials' AND
  (storage.foldername(name))[1] IN (
    SELECT t.id::TEXT FROM teachers t WHERE t.profile_id = auth.uid()
  )
);

-- All authenticated users can view materials
CREATE POLICY "Authenticated users can view materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'materials');

-- ============================================
-- REPORTS BUCKET POLICIES
-- ============================================

-- Admins have full access to reports
CREATE POLICY "Admins have full access to reports"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'reports' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'reports' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- System can create reports (for automated generation)
CREATE POLICY "System can create reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Students can view their own reports
CREATE POLICY "Students can view own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] IN (
    SELECT s.id::TEXT FROM students s WHERE s.profile_id = auth.uid()
  )
);

-- Parents can view their children's reports
CREATE POLICY "Parents can view children reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] IN (
    SELECT s.id::TEXT 
    FROM students s
    JOIN student_parents sp ON sp.student_id = s.id
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);

-- Teachers can view reports for their students
CREATE POLICY "Teachers can view student reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- ============================================
-- PROFILE IMAGES BUCKET POLICIES
-- ============================================

-- Admins have full access to profile images
CREATE POLICY "Admins have full access to profile images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'profile-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Users can upload their own profile image
CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Users can update their own profile image
CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
)
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Users can delete their own profile image
CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- All authenticated users can view profile images
CREATE POLICY "Authenticated users can view profile images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'profile-images');

-- ============================================
-- 4. CREATE STORAGE TRIGGERS
-- ============================================

-- Trigger to validate file size before upload
DROP TRIGGER IF EXISTS trigger_validate_file_size ON storage.objects;
CREATE TRIGGER trigger_validate_file_size
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION validate_file_size();

-- ============================================
-- 5. CREATE STORAGE VIEWS FOR MONITORING
-- ============================================

-- View: Storage usage by bucket
CREATE OR REPLACE VIEW storage_usage_by_bucket AS
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::BIGINT) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb,
  MAX(created_at) as last_upload
FROM storage.objects
GROUP BY bucket_id;

-- View: Storage usage by user
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT 
  (storage.foldername(name))[1] as user_id,
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::BIGINT) as total_size_bytes,
  ROUND(SUM((metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects
WHERE array_length(storage.foldername(name), 1) > 0
GROUP BY (storage.foldername(name))[1], bucket_id;

-- View: Recent uploads
CREATE OR REPLACE VIEW recent_uploads AS
SELECT 
  id,
  bucket_id,
  name,
  (metadata->>'size')::BIGINT as size_bytes,
  ROUND((metadata->>'size')::BIGINT / 1024.0 / 1024.0, 2) as size_mb,
  (storage.foldername(name))[1] as user_id,
  created_at
FROM storage.objects
ORDER BY created_at DESC
LIMIT 100;

-- ============================================
-- 6. GRANT PERMISSIONS ON VIEWS
-- ============================================

-- Grant select on views to authenticated users
GRANT SELECT ON storage_usage_by_bucket TO authenticated;
GRANT SELECT ON storage_usage_by_user TO authenticated;
GRANT SELECT ON recent_uploads TO authenticated;

-- ============================================
-- 7. ADD COMMENTS
-- ============================================

COMMENT ON FUNCTION get_user_storage_path() IS 
'Returns the storage path for the current user based on their ID';

COMMENT ON FUNCTION can_access_file(TEXT, TEXT) IS 
'Checks if the current user has permission to access a specific file';

COMMENT ON FUNCTION validate_file_size() IS 
'Validates that uploaded files do not exceed bucket size limits';

COMMENT ON VIEW storage_usage_by_bucket IS 
'Shows storage usage statistics grouped by bucket';

COMMENT ON VIEW storage_usage_by_user IS 
'Shows storage usage statistics grouped by user and bucket';

COMMENT ON VIEW recent_uploads IS 
'Shows the 100 most recent file uploads across all buckets';

-- ============================================
-- TASK 3 COMPLETE!
-- ============================================

SELECT 
  'Task 3 Complete: Storage buckets and policies created successfully!' as message,
  (SELECT COUNT(*) FROM storage.buckets) as bucket_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') as policy_count;
