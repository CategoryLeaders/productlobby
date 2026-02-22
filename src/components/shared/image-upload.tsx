'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { uploadImage, validateImage, deleteImage } from '@/lib/upload'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  onUploadComplete?: (url: string, file: File) => void
  onError?: (error: string) => void
  multiple?: boolean
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
  disabled?: boolean
}

interface UploadedImage {
  id: string
  url: string
  file: File
  isUploading: boolean
  error?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  onError,
  multiple = false,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className,
  disabled = false,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback(
    (files: FileList | null): File[] => {
      if (!files) return []

      const validFiles: File[] = []
      const errors: string[] = []

      Array.from(files).forEach((file) => {
        const validation = validateImage(file)
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        const errorMsg = errors.join('\n')
        onError?.(errorMsg)
      }

      if (!multiple && validFiles.length > 1) {
        onError?.('Only one image can be uploaded at a time')
        return validFiles.slice(0, 1)
      }

      if (uploadedImages.length + validFiles.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} images allowed`)
        return validFiles.slice(0, maxFiles - uploadedImages.length)
      }

      return validFiles
    },
    [multiple, maxFiles, uploadedImages.length, onError]
  )

  const processFiles = useCallback(
    async (files: File[]) => {
      const newImages: UploadedImage[] = files.map((file) => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
        isUploading: true,
      }))

      setUploadedImages((prev) => [...prev, ...newImages])

      for (const image of newImages) {
        try {
          setUploadProgress((prev) => ({ ...prev, [image.id]: 10 }))

          const uploadedFile = await uploadImage(image.file, 'campaigns')

          setUploadProgress((prev) => ({ ...prev, [image.id]: 100 }))

          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, url: uploadedFile.url, isUploading: false }
                : img
            )
          )

          onUploadComplete?.(uploadedFile.url, image.file)

          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev }
              delete newProgress[image.id]
              return newProgress
            })
          }, 500)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Upload failed'
          setUploadedImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, isUploading: false, error: errorMsg }
                : img
            )
          )
          onError?.(errorMsg)
        }
      }
    },
    [onUploadComplete, onError]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = handleFileValidation(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const files = handleFileValidation(e.currentTarget.files)
    if (files.length > 0) {
      processFiles(files)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = async (id: string) => {
    const image = uploadedImages.find((img) => img.id === id)
    if (!image) return

    if (!image.isUploading && image.url.startsWith('http')) {
      try {
        await deleteImage(image.url.split('/').pop() || image.url)
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }

    setUploadedImages((prev) => prev.filter((img) => img.id !== id))

    if (image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
  }

  const acceptString = acceptedTypes.join(',')
  const progress = uploadProgress

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 sm:p-8 transition-all duration-200',
          isDragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptString}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-label="Upload images"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />

          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground mb-1">
              Drop your images here
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-violet-600 hover:text-violet-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                click to browse
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {maxFiles > 1
              ? `Up to ${maxFiles} images, max 5MB each`
              : 'JPEG, PNG, WebP or GIF up to 5MB'}
          </p>
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {uploadedImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden bg-gray-100"
            >
              {/* Image Container */}
              <div className="relative w-full h-24 sm:h-28 bg-gray-200">
                <Image
                  src={image.url}
                  alt="Uploaded preview"
                  fill
                  className="w-full h-full object-cover"
                />

                {/* Upload Progress Overlay */}
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-1" />
                      <p className="text-xs text-white font-medium">
                        {progress[image.id] || 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {image.error && (
                  <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center p-2">
                    <div className="text-center">
                      <AlertCircle className="w-5 h-5 text-white mx-auto mb-1" />
                      <p className="text-xs text-white font-medium line-clamp-2">
                        {image.error}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(image.id)}
                disabled={image.isUploading}
                className={cn(
                  'absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white shadow-md transition-all duration-200 touch-target',
                  'opacity-0 group-hover:opacity-100 sm:opacity-100',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label={`Remove image ${image.id}`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Success Indicator */}
              {!image.isUploading && !image.error && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Limit Warning */}
      {uploadedImages.length >= maxFiles && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-yellow-800">
            Maximum number of images ({maxFiles}) reached
          </p>
        </div>
      )}
    </div>
  )
}
