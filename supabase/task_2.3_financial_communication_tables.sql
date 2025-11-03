-- ============================================
-- TASK 2.3: CREATE FINANCIAL AND COMMUNICATION TABLES
-- ============================================
-- This script creates financial and communication tables
-- Requirements: 2.7, 6.1, 6.6, 8.1, 8.6

-- ============================================
-- 1. CREATE FINANCIAL TABLES
-- ============================================

-- Fee structures table: Defines fee amounts by grade level and academic year
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('tuition', 'admission', 'exam', 'sports', 'pta', 'library', 'uniform', 'transport', 'other')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure valid amount
  CONSTRAINT valid_fee_amount CHECK (amount >= 0),
  
  -- Prevent duplicate fee types for same grade and year
  UNIQUE(academic_year_id, grade_level, fee_type)
);

-- Payments table: Records all fee payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'card', 'cheque')),
  payment_reference TEXT UNIQUE,
  payment_gateway TEXT CHECK (payment_gateway IN ('paystack', 'mtn_momo', 'hubtel', 'manual')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_id TEXT,
  receipt_url TEXT,
  remarks TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure valid payment amount
  CONSTRAINT valid_payment_amount CHECK (amount > 0)
);

-- Payment items table: Breakdown of what each payment covers
CREATE TABLE IF NOT EXISTS payment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_item_amount CHECK (amount > 0)
);

-- ============================================
-- 2. CREATE COMMUNICATION TABLES
-- ============================================

-- Announcements table: School-wide or targeted announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_audience TEXT[] NOT NULL DEFAULT '{}',
  target_roles TEXT[] CHECK (target_roles <@ ARRAY['admin', 'teacher', 'student', 'parent']::TEXT[]),
  target_classes UUID[],
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure target audience is specified
  CONSTRAINT has_target_audience CHECK (
    array_length(target_audience, 1) > 0 OR 
    array_length(target_roles, 1) > 0 OR 
    array_length(target_classes, 1) > 0
  )
);

-- Messages table: Direct messages between users
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  attachment_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent self-messaging
  CONSTRAINT no_self_messaging CHECK (sender_id != recipient_id)
);

-- Notifications table: System notifications for users
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('announcement', 'grade', 'payment', 'attendance', 'message', 'system', 'reminder')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure notification has content
  CONSTRAINT has_notification_content CHECK (
    length(trim(title)) > 0 AND length(trim(message)) > 0
  )
);

-- ============================================
-- 3. CREATE MATERIALS AND AUDIT TABLES
-- ============================================

-- Materials table: Teaching materials and resources
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure material has title and file
  CONSTRAINT has_material_content CHECK (
    length(trim(title)) > 0 AND length(trim(file_url)) > 0
  )
);

-- Audit logs table: Track all important system changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure audit log has required fields
  CONSTRAINT has_audit_data CHECK (
    length(trim(action)) > 0 AND length(trim(table_name)) > 0
  )
);

-- ============================================
-- 4. CREATE FINANCIAL CALCULATION FUNCTIONS
-- ============================================

-- Function: Calculate total fees for a student in an academic year
CREATE OR REPLACE FUNCTION calculate_total_fees(
  p_student_id UUID,
  p_academic_year_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_grade_level INTEGER;
  v_total_fees DECIMAL := 0;
BEGIN
  -- Get student's grade level
  SELECT c.grade_level INTO v_grade_level
  FROM students s
  JOIN class_enrollments ce ON ce.student_id = s.id
  JOIN classes c ON c.id = ce.class_id
  WHERE s.id = p_student_id 
    AND c.academic_year_id = p_academic_year_id
    AND ce.status = 'active'
  LIMIT 1;
  
  -- Calculate total mandatory fees
  SELECT COALESCE(SUM(amount), 0) INTO v_total_fees
  FROM fee_structures
  WHERE academic_year_id = p_academic_year_id
    AND grade_level = v_grade_level
    AND is_mandatory = true;
  
  RETURN v_total_fees;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate total payments made by a student
CREATE OR REPLACE FUNCTION calculate_total_payments(
  p_student_id UUID,
  p_academic_year_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_paid DECIMAL := 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM payments
  WHERE student_id = p_student_id
    AND academic_year_id = p_academic_year_id
    AND status = 'completed';
  
  RETURN v_total_paid;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate outstanding balance for a student
CREATE OR REPLACE FUNCTION calculate_outstanding_balance(
  p_student_id UUID,
  p_academic_year_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_fees DECIMAL;
  v_total_paid DECIMAL;
  v_balance DECIMAL;
BEGIN
  v_total_fees := calculate_total_fees(p_student_id, p_academic_year_id);
  v_total_paid := calculate_total_payments(p_student_id, p_academic_year_id);
  v_balance := v_total_fees - v_total_paid;
  
  RETURN GREATEST(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Get payment summary for a student
CREATE OR REPLACE FUNCTION get_payment_summary(
  p_student_id UUID,
  p_academic_year_id UUID
)
RETURNS TABLE(
  total_fees DECIMAL,
  total_paid DECIMAL,
  outstanding_balance DECIMAL,
  payment_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    calculate_total_fees(p_student_id, p_academic_year_id) as total_fees,
    calculate_total_payments(p_student_id, p_academic_year_id) as total_paid,
    calculate_outstanding_balance(p_student_id, p_academic_year_id) as outstanding_balance,
    CASE 
      WHEN calculate_total_fees(p_student_id, p_academic_year_id) > 0 
      THEN ROUND((calculate_total_payments(p_student_id, p_academic_year_id) / 
                  calculate_total_fees(p_student_id, p_academic_year_id)) * 100, 2)
      ELSE 0
    END as payment_percentage;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE NOTIFICATION FUNCTIONS
-- ============================================

-- Function: Create notification for user
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Create notifications for announcement
CREATE OR REPLACE FUNCTION notify_announcement_recipients()
RETURNS TRIGGER AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Only create notifications when announcement is published
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    -- Notify based on target roles
    IF array_length(NEW.target_roles, 1) > 0 THEN
      FOR v_user_record IN 
        SELECT id FROM profiles WHERE role = ANY(NEW.target_roles)
      LOOP
        PERFORM create_notification(
          v_user_record.id,
          'New Announcement: ' || NEW.title,
          substring(NEW.content, 1, 200),
          'announcement',
          '/announcements/' || NEW.id::TEXT
        );
      END LOOP;
    END IF;
    
    -- Notify based on target classes
    IF array_length(NEW.target_classes, 1) > 0 THEN
      FOR v_user_record IN 
        SELECT DISTINCT s.profile_id as id
        FROM students s
        JOIN class_enrollments ce ON ce.student_id = s.id
        WHERE ce.class_id = ANY(NEW.target_classes)
          AND ce.status = 'active'
      LOOP
        PERFORM create_notification(
          v_user_record.id,
          'New Announcement: ' || NEW.title,
          substring(NEW.content, 1, 200),
          'announcement',
          '/announcements/' || NEW.id::TEXT
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create notification when message is sent
CREATE OR REPLACE FUNCTION notify_message_recipient()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.recipient_id,
    'New Message from ' || (SELECT first_name || ' ' || last_name FROM profiles WHERE id = NEW.sender_id),
    substring(NEW.content, 1, 200),
    'message',
    '/messages/' || NEW.id::TEXT
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND (OLD.is_read IS NULL OR OLD.is_read = false) THEN
    NEW.read_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark message as read
CREATE OR REPLACE FUNCTION mark_message_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND (OLD.is_read IS NULL OR OLD.is_read = false) THEN
    NEW.read_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE AUDIT LOGGING FUNCTION
-- ============================================

-- Function: Generic audit logging
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CREATE TRIGGERS
-- ============================================

-- Update timestamps
DROP TRIGGER IF EXISTS trigger_fee_structures_updated_at ON fee_structures;
CREATE TRIGGER trigger_fee_structures_updated_at
BEFORE UPDATE ON fee_structures
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_payments_updated_at ON payments;
CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
CREATE TRIGGER trigger_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_materials_updated_at ON materials;
CREATE TRIGGER trigger_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Notification triggers
DROP TRIGGER IF EXISTS trigger_notify_announcement ON announcements;
CREATE TRIGGER trigger_notify_announcement
AFTER INSERT OR UPDATE OF is_published ON announcements
FOR EACH ROW
EXECUTE FUNCTION notify_announcement_recipients();

DROP TRIGGER IF EXISTS trigger_notify_message ON messages;
CREATE TRIGGER trigger_notify_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_message_recipient();

DROP TRIGGER IF EXISTS trigger_mark_notification_read ON notifications;
CREATE TRIGGER trigger_mark_notification_read
BEFORE UPDATE OF is_read ON notifications
FOR EACH ROW
EXECUTE FUNCTION mark_notification_read();

DROP TRIGGER IF EXISTS trigger_mark_message_read ON messages;
CREATE TRIGGER trigger_mark_message_read
BEFORE UPDATE OF is_read ON messages
FOR EACH ROW
EXECUTE FUNCTION mark_message_read();

-- Audit triggers for payments (critical financial data)
DROP TRIGGER IF EXISTS trigger_audit_payments ON payments;
CREATE TRIGGER trigger_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION audit_table_changes();

-- ============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Fee structures indexes
CREATE INDEX IF NOT EXISTS idx_fee_structures_academic_year ON fee_structures(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_grade_level ON fee_structures(grade_level);
CREATE INDEX IF NOT EXISTS idx_fee_structures_fee_type ON fee_structures(fee_type);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_academic_year ON payments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_payments_term ON payments(term_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);

-- Payment items indexes
CREATE INDEX IF NOT EXISTS idx_payment_items_payment ON payment_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_fee_structure ON payment_items(fee_structure_id);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_author ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON announcements(expires_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_class ON materials(class_id);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded_by ON materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_materials_published ON materials(is_published, published_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 9. ADD TABLE COMMENTS
-- ============================================

COMMENT ON TABLE fee_structures IS 'Defines fee amounts by grade level and academic year';
COMMENT ON TABLE payments IS 'Records all fee payments with payment gateway integration';
COMMENT ON TABLE payment_items IS 'Breakdown of what each payment covers';
COMMENT ON TABLE announcements IS 'School-wide or targeted announcements with priority levels';
COMMENT ON TABLE messages IS 'Direct messages between users with threading support';
COMMENT ON TABLE notifications IS 'System notifications for users with read tracking';
COMMENT ON TABLE materials IS 'Teaching materials and resources uploaded by teachers';
COMMENT ON TABLE audit_logs IS 'Audit trail of all important system changes';

-- ============================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. CREATE RLS POLICIES
-- ============================================

-- Fee structures policies
CREATE POLICY "Everyone can view fee structures" ON fee_structures 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage fee structures" ON fee_structures 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payments policies
CREATE POLICY "Students can view own payments" ON payments 
FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

CREATE POLICY "Parents can view children payments" ON payments 
FOR SELECT USING (
  student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all payments" ON payments 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payment items policies
CREATE POLICY "Users can view payment items for their payments" ON payment_items 
FOR SELECT USING (
  payment_id IN (SELECT id FROM payments WHERE student_id IN (
    SELECT id FROM students WHERE profile_id = auth.uid()
  ))
  OR payment_id IN (SELECT id FROM payments WHERE student_id IN (
    SELECT sp.student_id FROM student_parents sp
    JOIN parents p ON p.id = sp.parent_id
    WHERE p.profile_id = auth.uid()
  ))
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Announcements policies
CREATE POLICY "Everyone can view published announcements" ON announcements 
FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Teachers and admins can manage announcements" ON announcements 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Messages policies
CREATE POLICY "Users can view sent messages" ON messages 
FOR SELECT USING (sender_id = auth.uid());

CREATE POLICY "Users can view received messages" ON messages 
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages 
FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON messages 
FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can delete own sent messages" ON messages 
FOR DELETE USING (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications 
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications 
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications 
FOR INSERT WITH CHECK (true);

-- Materials policies
CREATE POLICY "Teachers can manage own materials" ON materials 
FOR ALL USING (
  uploaded_by IN (SELECT id FROM teachers WHERE profile_id = auth.uid())
);

CREATE POLICY "Students can view published materials for their classes" ON materials 
FOR SELECT USING (
  is_published = true AND (
    class_id IN (
      SELECT ce.class_id FROM class_enrollments ce
      JOIN students s ON s.id = ce.student_id
      WHERE s.profile_id = auth.uid() AND ce.status = 'active'
    )
    OR class_id IS NULL
  )
);

CREATE POLICY "Admins can manage all materials" ON materials 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Audit logs policies
CREATE POLICY "Admins can view audit logs" ON audit_logs 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- TASK 2.3 COMPLETE!
-- ============================================

SELECT 'Task 2.3 Complete: Financial and communication tables created successfully!' AS message;
