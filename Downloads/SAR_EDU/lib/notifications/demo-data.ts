// Demo notification and activity data generator

import { addNotification } from './notification-service'
import { NotificationType, UserRole } from '../types/notification'

export function initializeDemoNotifications(userId: string, userRole: UserRole): void {
  // Check if user already has notifications
  const existingNotifications = localStorage.getItem(`notifications_${userId}`)
  if (existingNotifications) {
    const data = JSON.parse(existingNotifications)
    if (data.notifications && data.notifications.length > 0) {
      return // Already initialized
    }
  }

  const now = Date.now()

  const demoNotifications: Record<string, Array<{
    type: NotificationType
    title: string
    message: string
    icon: string
    hoursAgo: number
    actionUrl?: string
    actionLabel?: string
  }>> = {
    admin: [
      {
        type: 'info',
        title: 'New Student Registered',
        message: 'Abdul-Rahman Ibrahim has been registered for Form 1A',
        icon: '👨‍🎓',
        hoursAgo: 2,
        actionUrl: '/dashboard/admin/students',
        actionLabel: 'View Student'
      },
      {
        type: 'success',
        title: 'Attendance Marked',
        message: 'Mrs. Owusu marked attendance for Form 2B - 35/38 students present',
        icon: '✅',
        hoursAgo: 3
      },
      {
        type: 'info',
        title: 'Exam Results Uploaded',
        message: 'Mr. Adjei uploaded Math exam results for Form 3C',
        icon: '📊',
        hoursAgo: 5,
        actionUrl: '/dashboard/admin/exams',
        actionLabel: 'View Results'
      },
      {
        type: 'success',
        title: 'Fee Payment Received',
        message: 'Fatima Yusuf paid term fees (GHS 1,200)',
        icon: '💰',
        hoursAgo: 8
      },
      {
        type: 'warning',
        title: 'Low Attendance Alert',
        message: 'Form 1C has only 28/40 students present today',
        icon: '⚠️',
        hoursAgo: 24
      }
    ],
    teacher: [
      {
        type: 'info',
        title: 'Homework Submitted',
        message: 'Fatima Yusuf submitted Math homework',
        icon: '📝',
        hoursAgo: 1,
        actionUrl: '/dashboard/teacher/homework',
        actionLabel: 'Review'
      },
      {
        type: 'info',
        title: 'Parent Message',
        message: 'Mrs. Amina sent you a message about Muhammad',
        icon: '💬',
        hoursAgo: 4
      },
      {
        type: 'warning',
        title: 'Attendance Reminder',
        message: 'Please mark attendance for Form 2B',
        icon: '⏰',
        hoursAgo: 6
      },
      {
        type: 'success',
        title: 'Class Schedule Updated',
        message: 'Your Friday schedule has been updated',
        icon: '📅',
        hoursAgo: 12
      }
    ],
    student: [
      {
        type: 'success',
        title: 'Grade Posted',
        message: 'Your Math exam grade is now available (85%)',
        icon: '📊',
        hoursAgo: 0.5,
        actionUrl: '/dashboard/student/grades',
        actionLabel: 'View Grade'
      },
      {
        type: 'info',
        title: 'New Homework Assigned',
        message: 'English homework due Friday - Essay on Ghana Independence',
        icon: '📝',
        hoursAgo: 3,
        actionUrl: '/dashboard/student/homework',
        actionLabel: 'View Details'
      },
      {
        type: 'info',
        title: 'Announcement',
        message: 'Sports Day scheduled for next Friday',
        icon: '📢',
        hoursAgo: 8
      },
      {
        type: 'warning',
        title: 'Exam Schedule',
        message: 'Mid-term exams begin next Monday',
        icon: '📅',
        hoursAgo: 24
      }
    ],
    parent: [
      {
        type: 'success',
        title: "Child's Grade Posted",
        message: 'Abdul-Rahman scored 85% in Math exam',
        icon: '📊',
        hoursAgo: 2,
        actionUrl: '/dashboard/parent/performance',
        actionLabel: 'View Report'
      },
      {
        type: 'success',
        title: 'Attendance Confirmed',
        message: 'Your child was present today',
        icon: '✅',
        hoursAgo: 5
      },
      {
        type: 'warning',
        title: 'Fee Reminder',
        message: 'Term fees due in 7 days (GHS 1,200)',
        icon: '💰',
        hoursAgo: 12,
        actionUrl: '/dashboard/parent/fee-status',
        actionLabel: 'Pay Now'
      },
      {
        type: 'info',
        title: 'School Event',
        message: 'Parent-Teacher meeting scheduled for next week',
        icon: '📅',
        hoursAgo: 24
      }
    ]
  }

  const notifications = demoNotifications[userRole] || []

  notifications.forEach(notif => {
    const timestamp = now - (notif.hoursAgo * 3600000)
    
    addNotification({
      type: notif.type,
      title: notif.title,
      message: notif.message,
      userId,
      userRole,
      icon: notif.icon,
      actionUrl: notif.actionUrl,
      actionLabel: notif.actionLabel
    })
  })
}
