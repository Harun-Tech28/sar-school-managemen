interface StoredData {
  key: string
  data: unknown
  timestamp: number
  synced: boolean
}

export interface DBError {
  type: 'QUOTA_EXCEEDED' | 'INIT_FAILED' | 'OPERATION_FAILED'
  message: string
  timestamp: number
}

class OfflineDB {
  private dbName = "EduSystemDB"
  private version = 1
  private db: IDBDatabase | null = null
  private errorHandler: ((error: DBError) => void) | null = null

  setErrorHandler(handler: (error: DBError) => void): void {
    this.errorHandler = handler
  }

  private handleError(type: DBError['type'], message: string, originalError?: unknown): void {
    const error: DBError = {
      type,
      message,
      timestamp: Date.now()
    }

    console.error(`[OfflineDB] ${type}:`, message, originalError)

    if (this.errorHandler) {
      this.errorHandler(error)
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version)

        request.onerror = () => {
          this.handleError('INIT_FAILED', 'Failed to initialize database', request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          this.db = request.result
          resolve()
        }

        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains("data")) {
            db.createObjectStore("data", { keyPath: "key" })
          }
          if (!db.objectStoreNames.contains("syncQueue")) {
            db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true })
          }
        }
      } catch (error) {
        this.handleError('INIT_FAILED', 'Exception during database initialization', error)
        reject(error)
      }
    })
  }

  async save(key: string, data: unknown): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(["data", "syncQueue"], "readwrite")
        const store = tx.objectStore("data")
        const syncStore = tx.objectStore("syncQueue")

        store.put({
          key,
          data,
          timestamp: Date.now(),
          synced: false,
        })

        syncStore.add({
          key,
          action: "update",
          timestamp: Date.now(),
        })

        tx.oncomplete = () => resolve()
        tx.onerror = () => {
          const error = tx.error
          if (error?.name === 'QuotaExceededError') {
            this.handleError('QUOTA_EXCEEDED', 'Storage quota exceeded. Please clear old data.', error)
          } else {
            this.handleError('OPERATION_FAILED', 'Failed to save data', error)
          }
          reject(error)
        }
      } catch (error: any) {
        if (error?.name === 'QuotaExceededError') {
          this.handleError('QUOTA_EXCEEDED', 'Storage quota exceeded. Please clear old data.', error)
        } else {
          this.handleError('OPERATION_FAILED', 'Exception during save operation', error)
        }
        reject(error)
      }
    })
  }

  async get(key: string): Promise<unknown> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["data"], "readonly")
      const store = tx.objectStore("data")
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result?.data)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(): Promise<StoredData[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["data"], "readonly")
      const store = tx.objectStore("data")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["data", "syncQueue"], "readwrite")
      const store = tx.objectStore("data")
      const syncStore = tx.objectStore("syncQueue")

      store.delete(key)
      syncStore.add({
        key,
        action: "delete",
        timestamp: Date.now(),
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getSyncQueue(): Promise<unknown[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["syncQueue"], "readonly")
      const store = tx.objectStore("syncQueue")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(["syncQueue"], "readwrite")
      const store = tx.objectStore("syncQueue")
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineDB = new OfflineDB()
