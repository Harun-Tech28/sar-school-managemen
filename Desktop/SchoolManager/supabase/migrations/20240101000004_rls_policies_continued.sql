-- ============================================
-- FEE_STRUCTURES TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to fee_structures"
  ON fee_structures FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "All authenticated users can view fee_structures"
  ON fee_structures FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to payments"
  ON payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  USING (student_id = get_student_id());

CREATE POLICY "Parents can view children's payments"
  ON payments FOR SELECT
  USING (is_parent_of(student_id));

CREATE POLICY "Parents can create payments for their children"
  ON payments FOR INSERT
  WITH CHECK (is_parent_of(student_id));

-- ============================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to announcements"
  ON announcements FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view announcements targeted to them"
  ON announcements FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      'all' = ANY(target_audience) OR
      get_user_role() = ANY(target_audience)
    ) AND (
      expires_at IS NULL OR expires_at > NOW()
    )
  );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to notifications"
  ON notifications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- MATERIALS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to materials"
  ON materials FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Teachers can manage materials"
  ON materials FOR ALL
  USING (
    is_teacher() AND (
      uploaded_by = get_teacher_id() OR
      class_id IN (
        SELECT class_id FROM class_subjects WHERE teacher_id = get_teacher_id()
      )
    )
  )
  WITH CHECK (
    is_teacher() AND (
      class_id IN (
        SELECT class_id FROM class_subjects WHERE teacher_id = get_teacher_id()
      )
    )
  );

CREATE POLICY "Students can view materials for their class"
  ON materials FOR SELECT
  USING (
    class_id = (SELECT class_id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view materials for children's classes"
  ON materials FOR SELECT
  USING (
    class_id IN (
      SELECT s.class_id FROM students s
      JOIN student_parents sp ON s.id = sp.student_id
      JOIN parents p ON sp.parent_id = p.id
      WHERE p.profile_id = auth.uid()
    )
  );

-- ============================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins have full access to audit_logs"
  ON audit_logs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_teacher() TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_parent_of(UUID) TO authenticated;
