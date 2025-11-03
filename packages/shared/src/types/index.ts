// User roles
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

// User and Profile types
export interface User {
  id: string
  email: string
  role: UserRole
  profile_id: string
}

export interface Profile {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  address?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

// Academic structure types
export type EducationalLevel = 'Creche' | 'Nursery' | 'KG' | 'Primary' | 'JHS'

export interface AcademicYear {
  id: string
  year_name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Term {
  id: string
  academic_year_id: string
  term_name: string
  term_number: 1 | 2 | 3
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

export interface Class {
  id: string
  class_name: string
  level: EducationalLevel
  grade_number?: number
  capacity?: number
  created_at: string
}

export interface Subject {
  id: string
  subject_name: string
  subject_code?: string
  description?: string
  created_at: string
}

// Student, Teacher, Parent types
export type StudentStatus = 'active' | 'inactive' | 'graduated'
export type Gender = 'Male' | 'Female'

export interface Student {
  id: string
  profile_id: string
  student_id: string
  class_id?: string
  date_of_birth?: string
  gender?: Gender
  admission_date: string
  status: StudentStatus
  created_at: string
  updated_at: string
  profile?: Profile
  class?: Class
}

export type TeacherStatus = 'active' | 'inactive'

export interface Teacher {
  id: string
  profile_id: string
  teacher_id: string
  qualification?: string
  specialization?: string
  hire_date: string
  status: TeacherStatus
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Parent {
  id: string
  profile_id: string
  occupation?: string
  created_at: string
  profile?: Profile
}

export type ParentRelationship = 'Father' | 'Mother' | 'Guardian'

export interface StudentParent {
  id: string
  student_id: string
  parent_id: string
  relationship: ParentRelationship
  is_primary: boolean
  created_at: string
}

// Attendance types
export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface Attendance {
  id: string
  student_id: string
  class_id?: string
  date: string
  status: AttendanceStatus
  marked_by?: string
  remarks?: string
  created_at: string
}

// Assessment and Grade types
export type AssessmentType = 'class_work' | 'homework' | 'test' | 'exam'

export interface Assessment {
  id: string
  class_id: string
  subject_id: string
  term_id?: string
  assessment_type: AssessmentType
  assessment_name: string
  total_marks: number
  date: string
  created_by?: string
  created_at: string
}

export interface Grade {
  id: string
  assessment_id: string
  student_id: string
  score: number
  remarks?: string
  recorded_by?: string
  created_at: string
  updated_at: string
}

// Payment types
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
export type PaymentGateway = 'paystack' | 'mtn_momo' | 'hubtel' | 'manual'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  student_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  payment_reference?: string
  payment_gateway?: PaymentGateway
  status: PaymentStatus
  term_id?: string
  recorded_by?: string
  receipt_url?: string
  created_at: string
}

// Communication types
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Announcement {
  id: string
  title: string
  content: string
  target_audience: string[]
  created_by?: string
  priority: NotificationPriority
  published_at: string
  expires_at?: string
  created_at: string
}

export interface Message {
  id: string
  sender_id?: string
  recipient_id?: string
  subject?: string
  content: string
  is_read: boolean
  sent_at: string
}

export type NotificationType = 'announcement' | 'grade' | 'payment' | 'attendance' | 'message'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  action_url?: string
  created_at: string
}

// Material types
export interface Material {
  id: string
  subject_id?: string
  class_id?: string
  title: string
  description?: string
  file_url: string
  file_type: string
  uploaded_by?: string
  created_at: string
}
