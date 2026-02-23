'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Upload, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  altText: string
  order: number
  createdAt: string
}

interface ImageGalleryProps {
  campaignId: string
  isCreator?: boolean
  maxImages?: number
}

export function ImageGallery({
  campaignId,
  isCreator = false,
  maxImages = 10,
}: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)

  // Fetch gallery images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/gallery`)

        if (!response.ok) {
          throw new Error('Failed to fetch gallery images')
        }

        const data = await response.json()
        setImages(data.data.images || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching gallery:', err)
        setError('Failed to load gallery images')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [campaignId])

  // Handle image upload
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      setUploading(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          altText: altText.trim(),
          order: images.length,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImages([...images, data.data])
      setImageUrl('')
      setAltText('')
      setShowUploadForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  // Navigate lightbox
  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
      </div>
    )
  }

  if (images.length === 0 && !isCreator) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No gallery images yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Form */}
      {isCreator && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              className="w-full flex items-center justify-center gap-2 text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Add Image
            </button>
          ) : (
            <form onSubmit={handleUploadImage} className="space-y-3">
              <input
                type="url"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                placeholder="Alt text (optional)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false)
                    setImageUrl('')
                    setAltText('')
                    setError(null)
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
              {images.length >= maxImages && (
                <p className="text-sm text-amber-600">
                  Maximum {maxImages} images reached
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setCurrentImageIndex(index)
                  setLightboxOpen(true)
                }}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {isCreator && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Delete functionality can be added here
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white transition-opacity"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Lightbox */}
          {lightboxOpen && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="relative max-w-4xl w-full">
                {/* Close Button */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-10"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Main Image */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <Image
                    src={images[currentImageIndex].url}
                    alt={images[currentImageIndex].altText || 'Gallery image'}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Counter */}
                <div className="text-center text-white mt-4">
                  <p className="text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </p>
                  {images[currentImageIndex].altText && (
                    <p className="text-xs text-gray-300 mt-1">
                      {images[currentImageIndex].altText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
