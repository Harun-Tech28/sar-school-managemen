// Activity service for managing activity feed

import { Activity } from '../types/notification'

const STORAGE_KEY_PREFIX = 'activities_'

// Get activities for a specific role
export function getActivities(userRole: string, limit: number = 10): Activity[] {
  if (typeof window === 'undefined') return []
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userRole}`
  const activitiesJson = localStorage.getItem(storageKey)
  
  if (!activitiesJson) return []
  
  try {
    const data = JSON.parse(activitiesJson)
    const activities = data.activities || []
    
    // Sort by timestamp (newest first) and limit
    return activities
      .sort((a: Activity, b: Activity) => b.timestamp - a.timestamp)
      .slice(0, limit)
  } catch {
    return []
  }
}

// Save activities to localStorage
function saveActivities(userRole: string, activities: Activity[]): void {
  if (typeof window === 'undefined') return
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userRole}`
  const data = {
    activities,
    lastUpdate: Date.now()
  }
  
  localStorage.setItem(storageKey, JSON.stringify(data))
}

// Add a new activity
export function addActivity(
  activity: Omit<Activity, 'id' | 'timestamp'>,
  roles: string[] = ['admin'] // Which roles should see this activity
): Activity {
  const newActivity: Activity = {
    ...activity,
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  }
  
  // Add activity to each role's feed
  roles.forEach(role => {
    const activities = getActivities(role, 200) // Get more for cleanup
    activities.unshift(newActivity)
    
    // Keep only last 100 activities per role
    const trimmedActivities = activities.slice(0, 100)
    
    saveActivities(role, trimmedActivities)
  })
  
  return newActivity
}

// Cleanup old activities (keep last 100)
export function cleanupActivities(userRole: string): void {
  const activities = getActivities(userRole, 200)
  
  if (activities.length > 100) {
    const trimmedActivities = activities.slice(0, 100)
    saveActivities(userRole, trimmedActivities)
  }
}

// Clear all activities for a role
export function clearActivities(userRole: string): void {
  if (typeof window === 'undefined') return
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userRole}`
  localStorage.removeItem(storageKey)
}

// Get relative time string (same as notification service)
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(timestamp).toLocaleDateString()
}

// Initialize demo activities for a role
export function initializeDemoActivities(userRole: string): void {
  const existingActivities = getActivities(userRole, 1)
  
  // Only initialize if no activities exist
  if (existingActivities.length > 0) return
  
  const demoActivities: Record<string, Omit<Activity, 'id' | 'timestamp'>[]> = {
    admin: [
      {
        type: 'student_registered',
        description: 'Abdul-Rahman Ibrahim registered for Form 1A',
        userId: 'student_001',
        icon: '👨‍🎓',
        color: 'blue'
      },
      {
        type: 'attendance_marked',
        description: 'Mrs. Owusu marked attendance for Form 2B',
        userId: 'teacher_001',
        icon: '✅',
        color: 'green'
      },
      {
        type: 'grade_posted',
        description: 'Mr. Adjei posted Math exam results for Form 3C',
        userId: 'teacher_002',
        icon: '📊',
        color: 'purple'
      },
      {
        type: 'fee_paid',
        description: 'Fatima Yusuf paid term fees (GHS 1,200)',
        userId: 'student_002',
        icon: '💰',
        color: 'yellow'
      },
      {
        type: 'homework_assigned',
        description: 'Mr. Mensah assigned English homework to Form 1A',
        userId: 'teacher_003',
        icon: '📝',
        color: 'orange'
      }
    ],
    teacher: [
      {
        type: 'homework_assigned',
        description: 'You assigned Math homework to Form 2B',
        icon: '📝',
        color: 'orange'
      },
      {
        type: 'attendance_marked',
        description: 'You marked attendance for Form 2B (35/38 present)',
        icon: '✅',
        color: 'green'
      },
      {
        type: 'grade_posted',
        description: 'You posted quiz results for Form 2B',
        icon: '📊',
        color: 'purple'
      },
      {
        type: 'student_registered',
        description: 'New student Muhammad Hassan joined your class',
        userId: 'student_003',
        icon: '👨‍🎓',
        color: 'blue'
      }
    ],
    student: [
      {
        type: 'grade_posted',
        description: 'Your Math exam grade is now available (85%)',
        icon: '📊',
        color: 'purple'
      },
      {
        type: 'homework_assigned',
        description: 'New English homework assigned - Due Friday',
        icon: '📝',
        color: 'orange'
      },
      {
        type: 'attendance_marked',
        description: 'Your attendance was marked for today',
        icon: '✅',
        color: 'green'
      },
      {
        type: 'fee_paid',
        description: 'Your term fees payment was confirmed',
        icon: '💰',
        color: 'yellow'
      }
    ],
    parent: [
      {
        type: 'grade_posted',
        description: "Your child's Math exam grade posted (85%)",
        userId: 'student_001',
        icon: '📊',
        color: 'purple'
      },
      {
        type: 'attendance_marked',
        description: 'Your child was present today',
        userId: 'student_001',
        icon: '✅',
        color: 'green'
      },
      {
        type: 'fee_paid',
        description: 'Term fees payment received - Thank you!',
        icon: '💰',
        color: 'yellow'
      },
      {
        type: 'homework_assigned',
        description: 'New homework assigned to your child',
        userId: 'student_001',
        icon: '📝',
        color: 'orange'
      }
    ]
  }
  
  const activities = demoActivities[userRole] || []
  
  // Add activities with staggered timestamps
  activities.forEach((activity, index) => {
    const hoursAgo = (index + 1) * 2 // 2, 4, 6, 8 hours ago
    const timestamp = Date.now() - (hoursAgo * 3600000)
    
    const activityWithTimestamp: Activity = {
      ...activity,
      id: `activity_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp
    }
    
    const existingActivities = getActivities(userRole, 200)
    existingActivities.push(activityWithTimestamp)
    saveActivities(userRole, existingActivities)
  })
}
