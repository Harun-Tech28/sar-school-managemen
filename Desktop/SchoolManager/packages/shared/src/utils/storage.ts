import { SupabaseClient } from '../config/supabase'

export type StorageBucket = 'documents' | 'materials' | 'reports' | 'profile-images'

export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File | Blob
  contentType?: string
}

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  supabase: SupabaseClient,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const { bucket, path, file, contentType } = options

    // Validate file size
    const maxSize = bucket === 'profile-images' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      }
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Update an existing file in Supabase Storage
 */
export const updateFile = async (
  supabase: SupabaseClient,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    const { bucket, path, file, contentType } = options

    // Upload with upsert
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true,
      })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get a signed URL for private file access
 */
export const getSignedUrl = async (
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { error: error.message }
    }

    return { url: data.signedUrl }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get public URL for a file
 */
export const getPublicUrl = (
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string
): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * List files in a folder
 */
export const listFiles = async (
  supabase: SupabaseClient,
  bucket: StorageBucket,
  folder: string = ''
): Promise<{ files: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder)

    if (error) {
      return { files: [], error: error.message }
    }

    return { files: data || [] }
  } catch (error) {
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Download a file
 */
export const downloadFile = async (
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string
): Promise<{ data?: Blob; error?: string }> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Generate a unique file path
 */
export const generateFilePath = (
  folder: string,
  fileName: string,
  userId?: string
): string => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  if (userId) {
    return `${folder}/${userId}/${timestamp}_${randomStr}_${sanitizedFileName}`
  }
  
  return `${folder}/${timestamp}_${randomStr}_${sanitizedFileName}`
}

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`,
    }
  }
  return { valid: true }
}

/**
 * Get file extension
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
