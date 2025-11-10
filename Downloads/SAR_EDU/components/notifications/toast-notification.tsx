"use client"

import { useEffect } from "react"
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { NotificationType } from "@/lib/types/notification"

interface ToastNotificationProps {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  onDismiss: (id: string) => void
}

export function ToastNotification({
  id,
  type,
  title,
  message,
  duration = 5000,
  onDismiss
}: ToastNotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />
      case "warning":
        return <AlertTriangle size={20} />
      case "error":
        return <XCircle size={20} />
      case "info":
        return <Info size={20} />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white"
      case "warning":
        return "bg-[#FFD100] text-gray-800"
      case "error":
        return "bg-[#E31E24] text-white"
      case "info":
        return "bg-blue-500 text-white"
    }
  }

  return (
    <div
      className={`${getStyles()} rounded-lg shadow-lg p-4 min-w-80 max-w-md animate-slideInRight`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
