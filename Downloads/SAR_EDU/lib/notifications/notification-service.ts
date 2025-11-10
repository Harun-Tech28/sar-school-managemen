// Notification service for managing notifications

import { Notification } from '../types/notification'

const STORAGE_KEY_PREFIX = 'notifications_'

// Get all notifications for a user
export function getNotifications(userId: string, userRole?: string): Notification[] {
  if (typeof window === 'undefined') return []
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
  const notificationsJson = localStorage.getItem(storageKey)
  
  if (!notificationsJson) return []
  
  try {
    const data = JSON.parse(notificationsJson)
    let notifications = data.notifications || []
    
    // Filter by role if provided
    if (userRole) {
      notifications = notifications.filter((n: Notification) => 
        n.userRole === userRole || n.userRole === 'all'
      )
    }
    
    // Sort by timestamp (newest first)
    return notifications.sort((a: Notification, b: Notification) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

// Save notifications to localStorage
function saveNotifications(userId: string, notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
  const data = {
    notifications,
    lastFetch: Date.now()
  }
  
  localStorage.setItem(storageKey, JSON.stringify(data))
}

// Add a new notification
export function addNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false
  }
  
  const notifications = getNotifications(notification.userId)
  notifications.unshift(newNotification)
  
  // Keep only last 100 notifications
  const trimmedNotifications = notifications.slice(0, 100)
  
  saveNotifications(notification.userId, trimmedNotifications)
  
  return newNotification
}

// Mark a notification as read
export function markAsRead(userId: string, notificationId: string): boolean {
  const notifications = getNotifications(userId)
  const notification = notifications.find(n => n.id === notificationId)
  
  if (!notification) return false
  
  notification.read = true
  saveNotifications(userId, notifications)
  
  return true
}

// Mark all notifications as read
export function markAllAsRead(userId: string): number {
  const notifications = getNotifications(userId)
  let count = 0
  
  notifications.forEach(notification => {
    if (!notification.read) {
      notification.read = true
      count++
    }
  })
  
  if (count > 0) {
    saveNotifications(userId, notifications)
  }
  
  return count
}

// Delete a notification
export function deleteNotification(userId: string, notificationId: string): boolean {
  const notifications = getNotifications(userId)
  const filteredNotifications = notifications.filter(n => n.id !== notificationId)
  
  if (filteredNotifications.length === notifications.length) return false
  
  saveNotifications(userId, filteredNotifications)
  return true
}

// Get unread notification count
export function getUnreadCount(userId: string, userRole?: string): number {
  const notifications = getNotifications(userId, userRole)
  return notifications.filter(n => !n.read).length
}

// Clear all notifications for a user
export function clearAllNotifications(userId: string): void {
  if (typeof window === 'undefined') return
  
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
  localStorage.removeItem(storageKey)
}

// Get relative time string
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
