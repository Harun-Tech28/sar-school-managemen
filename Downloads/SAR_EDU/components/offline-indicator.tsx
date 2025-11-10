"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check pending changes periodically
    const interval = setInterval(async () => {
      try {
        const stored = await (await import("@/lib/offline-db")).offlineDB.getSyncQueue()
        setPendingChanges(stored.length)
      } catch (error) {
        console.error("Error checking pending changes:", error)
      }
    }, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (isOnline && pendingChanges === 0) {
    return null
  }

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 z-50 ${
        isOnline ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>{pendingChanges > 0 ? `Syncing (${pendingChanges} pending)` : "Online"}</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>Offline Mode</span>
        </>
      )}
    </div>
  )
}
