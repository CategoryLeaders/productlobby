'use client'

import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatar: string | null
  displayName: string
  onAvatarChange: (url: string) => void
  onUploadStart?: () => void
  onUploadEnd?: () => void
  disabled?: boolean
}

export function AvatarUpload({
  currentAvatar,
  displayName,
  onAvatarChange,
  onUploadStart,
  onUploadEnd,
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 4.5 * 1024 * 1024) {
      setError('File size must be less than 4.5MB')
      return
    }

    setError(null)
    setIsUploading(true)
    onUploadStart?.()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            onAvatarChange(response.data.url)
            setUploadProgress(0)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          } else {
            setError(response.error || 'Upload failed')
          }
        } else {
          const response = JSON.parse(xhr.responseText)
          setError(response.error || 'Upload failed')
        }
        setIsUploading(false)
        onUploadEnd?.()
      })

      xhr.addEventListener('error', () => {
        setError('Upload failed')
        setIsUploading(false)
        onUploadEnd?.()
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (err) {
      setError('An error occurred during upload')
      setIsUploading(false)
      onUploadEnd?.()
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAvatarChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all overflow-hidden',
          isDragging ? 'ring-2 ring-violet-400 bg-violet-50' : 'bg-gray-100 hover:bg-gray-200',
          disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
        )}
      >
        {/* Avatar Image or Initials */}
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-violet-100">
            <span className="text-4xl font-bold text-violet-600">{initials || '?'}</span>
          </div>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="text-white text-sm font-medium">{uploadProgress}%</div>
            <div className="w-16 h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-lime-400 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Camera Icon Overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all group">
            <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Remove Button */}
        {currentAvatar && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Instructions */}
      <div className="text-center text-sm">
        <p className="text-gray-600">
          {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-gray-500 text-xs">PNG, JPG, GIF up to 4.5MB</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-full text-center">
          {error}
        </div>
      )}
    </div>
  )
}
