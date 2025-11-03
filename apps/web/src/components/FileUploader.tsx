import { useRef, useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { validateFileType, validateFileSize, formatFileSize, type StorageBucket } from '@sar-school/shared'

interface FileUploaderProps {
  bucket: StorageBucket
  path: string
  accept?: string
  maxSizeMB?: number
  allowedTypes?: string[]
  onUploadComplete?: (url: string, path: string) => void
  onError?: (error: string) => void
  label?: string
  className?: string
}

export const FileUploader = ({
  bucket,
  path,
  accept,
  maxSizeMB = 10,
  allowedTypes = [],
  onUploadComplete,
  onError,
  label = 'Upload File',
  className = '',
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const { upload, uploading, progress, error } = useFileUpload({
    bucket,
    onSuccess: (result) => {
      if (result.url && result.path) {
        onUploadComplete?.(result.url, result.path)
        setSelectedFile(null)
      }
    },
    onError: (err) => {
      onError?.(err)
    },
  })

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (allowedTypes.length > 0) {
      const typeValidation = validateFileType(file, allowedTypes)
      if (!typeValidation.valid) {
        onError?.(typeValidation.error || 'Invalid file type')
        return
      }
    }

    // Validate file size
    const sizeValidation = validateFileSize(file, maxSizeMB)
    if (!sizeValidation.valid) {
      onError?.(sizeValidation.error || 'File too large')
      return
    }

    setSelectedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    await upload(selectedFile, path)
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {!selectedFile ? (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                {label}
              </button>
              <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Uploading... {progress}%
                </p>
              </div>
            )}

            {!uploading && (
              <div className="mt-4 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
