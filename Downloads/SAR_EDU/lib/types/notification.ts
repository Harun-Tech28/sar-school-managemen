export type NotificationType = "success" | "warning" | "error" | "info"

export type UserRole = "admin" | "teacher" | "student" | "parent" | "all"

export type ActivityType =
  | "student_registered"
  | "attendance_marked"
  | "grade_posted"
  | "homework_assigned"
  | "fee_paid"
  | "exam_scheduled"
  | "announcement_made"
  | "message_received"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  userId: string
  userRole: UserRole
  actionUrl?: string
  actionLabel?: string
  icon?: string
}

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: number
  userId?: string
  icon: string
  color: string
}

export interface NotificationStore {
  notifications: Notification[]
  lastFetch: number
}

export interface ActivityStore {
  activities: Activity[]
  lastUpdate: number
}
