"use client"

import { Trash2, ExternalLink } from "lucide-react"
import { Notification } from "@/lib/types/notification"
import { getRelativeTime } from "@/lib/notifications/notification-service"

interface NotificationItemProps {
  notification: Notification
  onDelete: (id: string) => void
  onAction?: (url: string) => void
}

export function NotificationItem({ notification, onDelete, onAction }: NotificationItemProps) {
  const handleAction = () => {
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl)
    }
  }

  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.read ? "bg-blue-50/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {notification.icon && (
          <div className="flex-shrink-0 text-2xl">{notification.icon}</div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-800 mb-1">
            {notification.title}
            {!notification.read && (
              <span className="ml-2 inline-block w-2 h-2 bg-[#E31E24] rounded-full"></span>
            )}
          </h4>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {getRelativeTime(notification.timestamp)}
            </span>
            {notification.actionUrl && notification.actionLabel && (
              <button
                onClick={handleAction}
                className="text-xs text-[#E31E24] hover:text-[#c91a1f] font-medium flex items-center gap-1"
              >
                {notification.actionLabel}
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(notification.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
