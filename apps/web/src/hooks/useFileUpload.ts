import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadFile, updateFile, deleteFile, type StorageBucket, type UploadResult } from '@sar-school/shared'

interface UseFileUploadOptions {
  bucket: StorageBucket
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const { bucket, onSuccess, onError } = options
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File, path: string) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await uploadFile(supabase, {
        bucket,
        path,
        file,
        contentType: file.type,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        onSuccess?.(result)
      } else {
        setError(result.error || 'Upload failed')
        onError?.(result.error || 'Upload failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  const update = async (file: File, path: string) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await updateFile(supabase, {
        bucket,
        path,
        file,
        contentType: file.type,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        onSuccess?.(result)
      } else {
        setError(result.error || 'Update failed')
        onError?.(result.error || 'Update failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed'
      setError(errorMessage)
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  const remove = async (path: string) => {
    setUploading(true)
    setError(null)

    try {
      const result = await deleteFile(supabase, bucket, path)

      if (!result.success) {
        setError(result.error || 'Delete failed')
        onError?.(result.error || 'Delete failed')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      onError?.(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }

  return {
    upload,
    update,
    remove,
    uploading,
    progress,
    error,
    reset,
  }
}
