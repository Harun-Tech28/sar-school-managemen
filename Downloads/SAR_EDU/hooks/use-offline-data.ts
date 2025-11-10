"use client"

import { useState, useCallback, useEffect } from "react"
import { offlineDB } from "@/lib/offline-db"
import { syncManager } from "@/lib/sync-manager"

export function useOfflineData<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue)
  const [isSynced, setIsSynced] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Load from offline storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await offlineDB.get(key)
        if (stored) {
          setData(stored as T)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading offline data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [key])

  const updateData = useCallback(
    async (newData: T) => {
      setData(newData)
      setIsSynced(false)

      try {
        await offlineDB.save(key, newData)

        // Try to sync immediately if online
        if (syncManager.isCurrentlyOnline()) {
          await syncManager.sync()
          setIsSynced(true)
        }
      } catch (error) {
        console.error("Error updating offline data:", error)
      }
    },
    [key],
  )

  return { data, updateData, isSynced, isLoading }
}
