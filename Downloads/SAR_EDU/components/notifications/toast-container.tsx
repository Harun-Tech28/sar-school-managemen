"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { ToastNotification } from "./toast-notification"
import { NotificationType } from "@/lib/types/notification"

interface Toast {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: NotificationType, title: string, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    (type: NotificationType, title: string, message: string, duration: number = 5000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newToast: Toast = { id, type, title, message, duration }

      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNotification
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onDismiss={dismissToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
