'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { useWizard } from './wizard-context'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 4.5 * 1024 * 1024
const MAX_IMAGES = 5

export function StepVisuals() {
  const { formData, setFormData } = useWizard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Use JPEG, PNG, WebP, or GIF.')
      return null
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 4.5MB.')
      return null
    }

    setUploading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataObj })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }
      const data = await res.json()
      return data.url
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const availableSlots = MAX_IMAGES - formData.images.length
    for (const file of Array.from(files).slice(0, availableSlots)) {
      const url = await uploadFile(file)
      if (url) {
        setFormData({ images: [...formData.images, url] })
        setUploadError('')
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files) return

    const availableSlots = MAX_IMAGES - formData.images.length
    for (const file of Array.from(files).slice(0, availableSlots)) {
      const url = await uploadFile(file)
      if (url) {
        setFormData({ images: [...formData.images, url] })
        setUploadError('')
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData({ images: formData.images.filter((_, i) => i !== index) })
  }

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ videoUrl: e.target.value })
  }

  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null

    let videoId = ''
    if (url.includes('youtube.com')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      videoId = match?.[1] || ''
    } else if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/)
      videoId = match?.[1] || ''
    }

    if (!videoId) return null

    return url.includes('vimeo')
      ? `https://player.vimeo.com/video/${videoId}`
      : `https://www.youtube.com/embed/${videoId}`
  }

  const videoEmbedUrl = getVideoEmbedUrl(formData.videoUrl)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Add Visuals</h2>
        <p className="text-gray-600">
          Images and videos make campaigns 3x more likely to succeed. Both are optional, but highly recommended.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Campaign Images <span className="text-gray-500 font-normal">(optional)</span>
          </label>

          {formData.images.length === 0 ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploading ? (
                <div>
                  <Loader2 className="w-10 h-10 animate-spin text-violet-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">
                    Drop images here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP or GIF up to 4.5MB each. Max 5 images.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Campaign visual ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                ))}

                {formData.images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center hover:border-violet-400 hover:bg-violet-50 transition disabled:opacity-50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-600">Add more</p>
                    </div>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500">
                {formData.images.length}/{MAX_IMAGES} images uploaded
              </p>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 mt-3 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{uploadError}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="videoUrl" className="block text-sm font-semibold text-gray-900 mb-3">
            Video URL <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            id="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={handleVideoUrlChange}
            placeholder="e.g., https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-2">
            Add a YouTube or Vimeo link. We'll embed a preview automatically.
          </p>

          {videoEmbedUrl && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={videoEmbedUrl}
                width="100%"
                height="300"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <p className="text-sm text-lime-800">
          <span className="font-semibold">Pro tip:</span> Campaigns with high-quality images and videos get 80% more supporter engagement. Take time to add visuals that showcase your campaign.
        </p>
      </div>
    </div>
  )
}
