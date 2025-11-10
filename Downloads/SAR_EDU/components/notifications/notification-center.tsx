"use client"

import { useEffect, useRef } from "react"
import { CheckCheck } from "lucide-react"
import { Notification } from "@/lib/types/notification"
import { NotificationItem } from "./notification-item"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAllRead: () => void
  onDelete: (id: string) => void
  onAction?: (url: string) => void
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onDelete,
  onAction
}: NotificationCenterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 animate-dropdownSlide overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#E31E24]/5 to-[#FFD100]/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-[#E31E24] hover:text-[#c91a1f] font-medium transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🔔</span>
            </div>
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-sm text-gray-500 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={onDelete}
              onAction={onAction}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-[#E31E24] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
