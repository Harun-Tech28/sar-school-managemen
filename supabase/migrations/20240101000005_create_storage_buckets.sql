-- Create storage buckets for file management

-- Documents bucket (school documents, forms, policies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
);

-- Materials bucket (teaching materials, assignments, notes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials',
  'materials',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png', 'text/plain']
);

-- Reports bucket (generated report cards, transcripts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- Profile images bucket (user profile photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================
-- STORAGE POLICIES FOR DOCUMENTS BUCKET
-- ============================================

-- Admins can do everything with documents
CREATE POLICY "Admins have full access to documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin')
  WITH CHECK (bucket_id = 'documents' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin');

-- All authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ============================================
-- STORAGE POLICIES FOR MATERIALS BUCKET
-- ============================================

-- Admins have full access to materials
CREATE POLICY "Admins have full access to materials"
  ON storage.objects FOR ALL
  USING (bucket_id = 'materials' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin')
  WITH CHECK (bucket_id = 'materials' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin');

-- Teachers can upload materials
CREATE POLICY "Teachers can upload materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'materials' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Teachers can update their own materials
CREATE POLICY "Teachers can update own materials"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'materials' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    (storage.foldername(name))[1] = (
      SELECT teacher_id::text FROM teachers WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'materials' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  );

-- Teachers can delete their own materials
CREATE POLICY "Teachers can delete own materials"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'materials' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    (storage.foldername(name))[1] = (
      SELECT teacher_id::text FROM teachers WHERE profile_id = auth.uid()
    )
  );

-- All authenticated users can view materials
CREATE POLICY "Authenticated users can view materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- ============================================
-- STORAGE POLICIES FOR REPORTS BUCKET
-- ============================================

-- Admins have full access to reports
CREATE POLICY "Admins have full access to reports"
  ON storage.objects FOR ALL
  USING (bucket_id = 'reports' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin')
  WITH CHECK (bucket_id = 'reports' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin');

-- System can create reports (for automated generation)
CREATE POLICY "System can create reports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports');

-- Students can view their own reports
CREATE POLICY "Students can view own reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    (storage.foldername(name))[1] = (
      SELECT id::text FROM students WHERE profile_id = auth.uid()
    )
  );

-- Parents can view their children's reports
CREATE POLICY "Parents can view children reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM students s
      JOIN student_parents sp ON s.id = sp.student_id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- Teachers can view reports for their students
CREATE POLICY "Teachers can view student reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM students s
      JOIN class_subjects cs ON s.class_id = cs.class_id
      WHERE cs.teacher_id = (SELECT id FROM teachers WHERE profile_id = auth.uid())
    )
  );

-- ============================================
-- STORAGE POLICIES FOR PROFILE-IMAGES BUCKET
-- ============================================

-- Admins have full access to profile images
CREATE POLICY "Admins have full access to profile images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'profile-images' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin')
  WITH CHECK (bucket_id = 'profile-images' AND (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin');

-- Users can upload their own profile image
CREATE POLICY "Users can upload own profile image"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own profile image
CREATE POLICY "Users can update own profile image"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile image
CREATE POLICY "Users can delete own profile image"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- All authenticated users can view profile images
CREATE POLICY "Authenticated users can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
