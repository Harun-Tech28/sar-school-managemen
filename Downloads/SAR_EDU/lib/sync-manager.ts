import { offlineDB } from "./offline-db"

interface SyncConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
}

export class SyncManager {
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true
  private syncInProgress = false
  private syncConfig: SyncConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  }

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline())
      window.addEventListener("offline", () => this.handleOffline())
    }
  }

  private handleOnline() {
    this.isOnline = true
    console.log("[Sync] Online - Starting sync")
    this.syncWithRetry()
  }

  private handleOffline() {
    this.isOnline = false
    console.log("[Sync] Offline - Changes will be synced when online")
  }

  async syncWithRetry(attempt: number = 0): Promise<void> {
    try {
      await this.sync()
    } catch (error) {
      if (attempt < this.syncConfig.maxRetries) {
        const delay = this.syncConfig.retryDelay * Math.pow(this.syncConfig.backoffMultiplier, attempt)
        console.log(`[Sync] Retry attempt ${attempt + 1}/${this.syncConfig.maxRetries} in ${delay}ms`)
        
        setTimeout(() => {
          this.syncWithRetry(attempt + 1)
        }, delay)
      } else {
        console.error(`[Sync] Failed after ${this.syncConfig.maxRetries} attempts:`, error)
        this.syncInProgress = false
      }
    }
  }

  async sync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return

    this.syncInProgress = true

    try {
      const syncQueue = await offlineDB.getSyncQueue()

      if (syncQueue.length === 0) {
        console.log("[Sync] No pending changes to sync")
        this.syncInProgress = false
        return
      }

      console.log(`[Sync] Syncing ${syncQueue.length} changes...`)

      // Simulate API sync delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would send syncQueue to your API
      // await fetch("/api/sync", { method: "POST", body: JSON.stringify(syncQueue) })

      await offlineDB.clearSyncQueue()
      console.log("[Sync] Sync completed successfully")
      this.syncInProgress = false
    } catch (error) {
      console.error("[Sync] Error during sync:", error)
      this.syncInProgress = false
      throw error // Re-throw to trigger retry logic
    }
  }

  isCurrentlyOnline(): boolean {
    return this.isOnline
  }

  isSyncing(): boolean {
    return this.syncInProgress
  }

  getPendingChanges(): Promise<unknown[]> {
    return offlineDB.getSyncQueue()
  }
}

export const syncManager = new SyncManager()
