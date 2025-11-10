"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { syncManager } from "@/lib/sync-manager"
import { offlineDB } from "@/lib/offline-db"
import { RefreshCw, AlertCircle, CheckCircle, Trash2 } from "lucide-react"

interface SyncItem {
  key: string
  action: string
  timestamp: number
}

export default function OfflineSettingsPage() {
  const [userName, setUserName] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [pendingChanges, setPendingChanges] = useState<SyncItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) {
      window.location.href = "/"
      return
    }
    setUserName(user.fullName || user.email.split("@")[0])

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Load pending changes
    loadPendingChanges()

    const interval = setInterval(loadPendingChanges, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const loadPendingChanges = async () => {
    try {
      const queue = (await offlineDB.getSyncQueue()) as SyncItem[]
      setPendingChanges(queue)
    } catch (error) {
      console.error("Error loading pending changes:", error)
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      await syncManager.sync()
      setLastSyncTime(new Date())
      await loadPendingChanges()
    } catch (error) {
      console.error("Error syncing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearQueue = async () => {
    if (confirm("Are you sure you want to clear the sync queue? This action cannot be undone.")) {
      try {
        await offlineDB.clearSyncQueue()
        setPendingChanges([])
      } catch (error) {
        console.error("Error clearing queue:", error)
      }
    }
  }

  const userRole = typeof window !== 'undefined' && localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").role || "admin"
    : "admin"

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole={userRole as "admin" | "teacher" | "parent"} />
      <div className="flex-1 flex flex-col">
        <Header userName={userName} userRole="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Offline Mode & Sync</h1>
              <p className="text-muted-foreground mt-1">Manage offline functionality and data synchronization</p>
            </div>

            {/* Status Section */}
            <Card className="p-6 bg-card border-border mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Connection Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border-2 ${
                    isOnline ? "bg-accent/10 border-accent" : "bg-destructive/10 border-destructive"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <CheckCircle size={24} className="text-accent" />
                        <div>
                          <p className="font-semibold text-foreground">Online</p>
                          <p className="text-sm text-muted-foreground">Connected to server</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={24} className="text-destructive" />
                        <div>
                          <p className="font-semibold text-foreground">Offline</p>
                          <p className="text-sm text-muted-foreground">Using cached data</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Last Sync</p>
                  <p className="font-semibold text-foreground">
                    {lastSyncTime ? lastSyncTime.toLocaleString() : "Not synced yet"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pending Changes Section */}
            <Card className="p-6 bg-card border-border mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Pending Changes</h3>
                <span className="px-3 py-1 rounded-full bg-muted text-foreground text-sm font-semibold">
                  {pendingChanges.length} pending
                </span>
              </div>

              {pendingChanges.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {pendingChanges.map((change) => (
                    <div
                      key={`${change.key}-${change.timestamp}`}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">{change.action.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{change.key}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">No pending changes. All data is synchronized.</p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSync} disabled={isLoading || !isOnline} className="gap-2">
                  <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Syncing..." : "Sync Now"}
                </Button>

                {pendingChanges.length > 0 && (
                  <Button
                    onClick={handleClearQueue}
                    variant="outline"
                    className="gap-2 text-destructive bg-transparent"
                  >
                    <Trash2 size={18} />
                    Clear Queue
                  </Button>
                )}
              </div>
            </Card>

            {/* Features Section */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Offline Features</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Local Data Caching</p>
                    <p className="text-sm text-muted-foreground">
                      All school data is cached locally for offline access
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Automatic Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Changes are automatically synced when connection is restored
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-accent mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Offline Indicators</p>
                    <p className="text-sm text-muted-foreground">
                      Visual indicators show connection status and pending changes
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
