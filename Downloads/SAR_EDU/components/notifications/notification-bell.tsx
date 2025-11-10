"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "./notification-center"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "@/lib/notifications/notification-service"
import { Notification } from "@/lib/types/notification"

interface NotificationBellProps {
  userId: string
  userRole: string
}

export function NotificationBell({ userId, userRole }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = () => {
    const allNotifications = getNotifications(userId, userRole)
    setNotifications(allNotifications)
    setUnreadCount(getUnreadCount(userId, userRole))
  }

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [userId, userRole])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    
    // Mark notifications as read when opening
    if (!isOpen && unreadCount > 0) {
      setTimeout(() => {
        notifications.forEach(notification => {
          if (!notification.read) {
            markAsRead(userId, notification.id)
          }
        })
        loadNotifications()
      }, 1000)
    }
  }

  const handleMarkAllRead = () => {
    markAllAsRead(userId)
    loadNotifications()
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification(userId, notificationId)
    loadNotifications()
  }

  const handleAction = (url: string) => {
    window.location.href = url
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-muted-foreground" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            <Badge count={unreadCount} pulse size="sm" />
          </div>
        )}
      </button>

      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
        onAction={handleAction}
      />
    </div>
  )
}
