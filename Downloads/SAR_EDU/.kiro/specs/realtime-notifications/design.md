# Design Document

## Overview

This design implements a comprehensive real-time notification system for the SAR Educational Complex application. It includes a notification bell with badge, toast notifications, a notification center dropdown, activity feed, and notification management with role-based filtering.

## Architecture

### Component Structure

```
components/
├── notifications/
│   ├── notification-bell.tsx       # Bell icon with badge
│   ├── notification-center.tsx     # Dropdown panel
│   ├── notification-item.tsx       # Single notification
│   ├── toast-notification.tsx      # Toast component
│   ├── toast-container.tsx         # Toast manager
│   └── activity-feed.tsx           # Activity feed widget
├── layout/
│   └── header.tsx                  # Updated with notification bell
└── ui/
    └── badge.tsx                   # Badge component

lib/
├── notifications/
│   ├── notification-store.ts       # Notification state management
│   ├── notification-service.ts     # Notification logic
│   └── activity-service.ts         # Activity feed logic
└── types/
    └── notification.ts             # TypeScript interfaces
```

## Components and Interfaces

### 1. Notification Data Model

```typescript
interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
  userId: string
  userRole: 'admin' | 'teacher' | 'student' | 'parent'
  actionUrl?: string
  actionLabel?: string
  icon?: string
}

interface Activity {
  id: string
  type: 'student_registered' | 'attendance_marked' | 'grade_posted' | 'homework_assigned' | 'fee_paid'
  description: string
  timestamp: number
  userId?: string
  icon: string
  color: string
}
```

### 2. Notification Bell Component

**Purpose:** Display notification icon with unread count

**Design:**
```tsx
interface NotificationBellProps {
  userRole: string
}

// Features:
- Bell icon (Lucide Bell)
- Red badge with count
- Animated pulse when new notification
- Opens notification center on click
```

**Visual:**
```
┌─────────┐
│   🔔    │  ← Bell icon
│    ⓵   │  ← Red badge (if unread)
└─────────┘
```

### 3. Notification Center

**Purpose:** Dropdown panel showing all notifications

**Design:**
```tsx
interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
}

// Layout:
- Header with "Notifications" title and "Mark all read" button
- Scrollable list of notifications (max 50)
- Empty state when no notifications
- Footer with "View all" link
```

**Visual:**
```
┌──────────────────────────────┐
│ Notifications    Mark all ✓  │
├──────────────────────────────┤
│ 🎓 New Student Registered    │
│    Kwame Asante joined...    │
│    2 hours ago          [×]  │
├──────────────────────────────┤
│ ✅ Attendance Marked         │
│    Form 2B - 35/38 present   │
│    3 hours ago          [×]  │
├──────────────────────────────┤
│ 📝 Exam Results Uploaded     │
│    Mid-term Math results...  │
│    5 hours ago          [×]  │
└──────────────────────────────┘
```

### 4. Toast Notification

**Purpose:** Temporary pop-up for immediate feedback

**Design:**
```tsx
interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  onDismiss: () => void
}

// Features:
- Auto-dismiss after 5 seconds
- Manual dismiss with X button
- Slide-in animation from top-right
- Color-coded by type
- Icon based on type
```

**Colors:**
- Success: Green background, white text
- Warning: Yellow background, dark text
- Error: Red background, white text
- Info: Blue background, white text

### 5. Activity Feed

**Purpose:** Show recent school activities

**Design:**
```tsx
interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
}

// Features:
- Shows 10 most recent activities
- Icon and color per activity type
- Relative timestamps
- Compact layout
```

## Data Models

### Notification Storage

```typescript
// LocalStorage structure
interface NotificationStore {
  notifications: Notification[]
  lastFetch: number
}

// Storage key: `notifications_${userId}`
```

### Activity Storage

```typescript
// LocalStorage structure
interface ActivityStore {
  activities: Activity[]
  lastUpdate: number
}

// Storage key: `activities_${userRole}`
```

## Notification Service

### Core Functions

```typescript
class NotificationService {
  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void
  
  // Get notifications for user
  getNotifications(userId: string, role: string): Notification[]
  
  // Mark as read
  markAsRead(notificationId: string): void
  
  // Mark all as read
  markAllAsRead(userId: string): void
  
  // Delete notification
  deleteNotification(notificationId: string): void
  
  // Get unread count
  getUnreadCount(userId: string): number
  
  // Show toast
  showToast(type: string, title: string, message: string): void
}
```

### Activity Service

```typescript
class ActivityService {
  // Add activity
  addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void
  
  // Get activities for role
  getActivities(role: string, limit?: number): Activity[]
  
  // Clear old activities (keep last 100)
  cleanupActivities(): void
}
```

## Role-Based Notifications

### Admin Notifications

- Student registrations
- Attendance submissions
- Exam results uploads
- Fee payments
- Teacher activities
- System alerts

### Teacher Notifications

- Homework submissions
- Parent messages
- Class schedule changes
- Attendance reminders
- Grade deadlines

### Student Notifications

- Grade postings
- Homework assignments
- Announcements
- Exam schedules
- Fee reminders

### Parent Notifications

- Child's grades
- Attendance alerts
- Fee due dates
- School events
- Teacher messages

## Animation Specifications

### Toast Animations

```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

Duration: 300ms
Easing: ease-out
```

### Badge Pulse

```css
@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

Duration: 2s
Easing: ease-in-out
Infinite: yes
```

### Notification Center

```css
@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

Duration: 200ms
Easing: ease-out
```

## Error Handling

### Storage Failures

- Fallback to in-memory storage
- Log errors to console
- Show user-friendly message
- Retry on next action

### Notification Failures

- Queue failed notifications
- Retry after delay
- Show error toast
- Don't block user actions

## Testing Strategy

### Unit Testing

1. Test notification service methods
2. Test activity service methods
3. Test storage operations
4. Test role filtering
5. Test timestamp formatting

### Integration Testing

1. Test notification flow end-to-end
2. Test toast display and dismiss
3. Test notification center open/close
4. Test mark as read functionality
5. Test activity feed updates

### Visual Testing

1. Verify toast colors and icons
2. Check badge positioning
3. Test notification center layout
4. Verify responsive design
5. Test animations

## Implementation Details

### LocalStorage Schema

```typescript
// Notifications
localStorage.setItem('notifications_user123', JSON.stringify({
  notifications: [...],
  lastFetch: Date.now()
}))

// Activities
localStorage.setItem('activities_admin', JSON.stringify({
  activities: [...],
  lastUpdate: Date.now()
}))
```

### Timestamp Formatting

```typescript
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
```

### Demo Notifications

```typescript
const demoNotifications = {
  admin: [
    {
      type: 'info',
      title: 'New Student Registered',
      message: 'Kwame Asante joined Form 1A',
      icon: '👨‍🎓',
      timestamp: Date.now() - 7200000 // 2 hours ago
    },
    {
      type: 'success',
      title: 'Attendance Marked',
      message: 'Form 2B - 35/38 students present',
      icon: '✅',
      timestamp: Date.now() - 10800000 // 3 hours ago
    }
  ],
  teacher: [
    {
      type: 'info',
      title: 'Homework Submitted',
      message: 'Ama Boateng submitted Math homework',
      icon: '📝',
      timestamp: Date.now() - 3600000 // 1 hour ago
    }
  ],
  student: [
    {
      type: 'success',
      title: 'Grade Posted',
      message: 'Your Math exam grade is now available',
      icon: '📊',
      timestamp: Date.now() - 1800000 // 30 minutes ago
    }
  ],
  parent: [
    {
      type: 'warning',
      title: 'Fee Reminder',
      message: 'Term fees due in 7 days',
      icon: '💰',
      timestamp: Date.now() - 86400000 // 1 day ago
    }
  ]
}
```

## Design Decisions

### Why LocalStorage Instead of Database?

**Rationale:**
- Simpler implementation for MVP
- No backend required
- Fast access
- Works offline
- Easy to migrate later

### Why Toast + Notification Center?

**Rationale:**
- Toast for immediate feedback
- Center for history and review
- Industry standard pattern
- Best of both worlds

### Why Role-Based Filtering?

**Rationale:**
- Relevant notifications only
- Reduces noise
- Better user experience
- Easier to manage

## Color Palette

### Notification Types

- **Success**: #10B981 (Green)
- **Warning**: #FFD100 (SAR Yellow)
- **Error**: #E31E24 (SAR Red)
- **Info**: #3B82F6 (Blue)

### UI Elements

- **Badge**: #E31E24 (SAR Red)
- **Badge Text**: #FFFFFF (White)
- **Unread**: #F3F4F6 (Light gray background)
- **Read**: #FFFFFF (White background)

---

**Status:** Ready for Implementation
**Priority:** High (High Impact Feature)
**Estimated Effort:** 3-4 days
