'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Link as LinkIcon,
  ImagePlus,
  Heading2,
  Eye,
  EyeOff,
  Upload,
  X,
} from 'lucide-react'

interface UpdateImage {
  id: string
  url: string
  file?: File
}

export interface UpdateEditorProps {
  value: string
  onChange: (value: string) => void
  images?: UpdateImage[]
  onImagesChange?: (images: UpdateImage[]) => void
  placeholder?: string
  className?: string
  previewMode?: boolean
  onPreviewToggle?: (preview: boolean) => void
  characterLimit?: number
}

export const UpdateEditor = React.forwardRef<
  HTMLDivElement,
  UpdateEditorProps
>(
  (
    {
      value,
      onChange,
      images = [],
      onImagesChange,
      placeholder = 'Share your update with supporters...',
      className,
      previewMode = false,
      onPreviewToggle,
      characterLimit = 5000,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [localImages, setLocalImages] = useState<UpdateImage[]>(images)
    const [isDragging, setIsDragging] = useState(false)

    const insertMarkdown = (before: string, after: string = '') => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selected = value.substring(start, end)
      const newValue =
        value.substring(0, start) +
        before +
        selected +
        after +
        value.substring(end)

      onChange(newValue)

      setTimeout(() => {
        const newCursorPos =
          start + before.length + (selected.length > 0 ? selected.length : 0)
        textarea.selectionStart = newCursorPos
        textarea.selectionEnd = newCursorPos
        textarea.focus()
      }, 0)
    }

    const handleImageSelect = (files: FileList | null) => {
      if (!files) return

      const newImages: UpdateImage[] = []

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          const newImage: UpdateImage = {
            id: `temp-${Date.now()}-${Math.random()}`,
            url,
            file,
          }
          setLocalImages((prev) => [...prev, newImage])
          onImagesChange?.([...localImages, newImage])
        }
        reader.readAsDataURL(file)
      })
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleImageSelect(e.dataTransfer.files)
    }

    const removeImage = (id: string) => {
      const updated = localImages.filter((img) => img.id !== id)
      setLocalImages(updated)
      onImagesChange?.(updated)
    }

    const characterCount = value.length
    const characterPercentage = (characterCount / characterLimit) * 100

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            Update Content
          </label>
          {onPreviewToggle && (
            <button
              onClick={() => onPreviewToggle(!previewMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {previewMode ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              )}
            </button>
          )}
        </div>

        {previewMode ? (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-64">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-lg border border-b-0 border-gray-200">
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**')}
                className="p-2 text-gray-600 hover:bg-white rounded transition-colors duration-200"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('_', '_')}
                className="p-2 text-gray-600 hover:bg-white rounded transition-colors duration-200"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](url)')}
                className="p-2 text-gray-600 hover:bg-white rounded transition-colors duration-200"
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('## ', '')}
                className="p-2 text-gray-600 hover:bg-white rounded transition-colors duration-200"
                title="Heading"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="ml-auto border-l border-gray-300 pl-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:bg-white rounded transition-colors duration-200"
                  title="Add image"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              maxLength={characterLimit}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'w-full px-4 py-3 border border-t-0 border-gray-200 rounded-b-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500',
                isDragging && 'bg-violet-50'
              )}
              rows={8}
            />

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>Drag & drop images or click the image button to upload</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-200',
                      characterPercentage > 90
                        ? 'bg-red-500'
                        : characterPercentage > 70
                          ? 'bg-orange-500'
                          : 'bg-violet-500'
                    )}
                    style={{ width: `${Math.min(characterPercentage, 100)}%` }}
                  />
                </div>
                <span
                  className={cn(
                    characterPercentage > 90 && 'text-red-600 font-semibold'
                  )}
                >
                  {characterCount}/{characterLimit}
                </span>
              </div>
            </div>
          </>
        )}

        {localImages.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Images ({localImages.length})
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {localImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
                >
                  <img
                    src={image.url}
                    alt="Update image"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageSelect(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }
)

UpdateEditor.displayName = 'UpdateEditor'
