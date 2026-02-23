'use client'

import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  url: string
  kind: 'IMAGE' | 'VIDEO' | 'SKETCH' | 'MOCKUP'
  altText?: string
  order: number
  createdAt: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  campaignTitle: string
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  campaignTitle,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-violet-200 rounded-lg bg-violet-50">
        <ImageIcon className="w-12 h-12 text-violet-300 mb-3" />
        <p className="text-violet-600 font-medium">No media yet</p>
        <p className="text-violet-500 text-sm">Images, videos, sketches, or mockups will appear here</p>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else if (selectedIndex !== null) {
      setSelectedIndex(media.length - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    } else {
      setSelectedIndex(0)
    }
  }

  const currentMedia = selectedIndex !== null ? media[selectedIndex] : null

  return (
    <>
      {/* Grid Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
          >
            {/* Media Preview */}
            <div className="relative w-full h-48 bg-gradient-to-br from-violet-100 to-violet-50">
              {item.kind === 'VIDEO' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.altText || `${campaignTitle} media ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3e8ff" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23a78bfa" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E'
                  }}
                />
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                <p className="text-sm font-medium">{item.kind}</p>
              </div>
            </div>

            {/* Badge */}
            <div className="absolute top-2 right-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
              {item.kind}
            </div>

            {/* Alt text if available */}
            {item.altText && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs line-clamp-2">{item.altText}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && currentMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full max-h-[80vh] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image/Video Display */}
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black">
              {currentMedia.kind === 'VIDEO' ? (
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.altText || 'Full view'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23111" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%23666" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E'
                  }}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            {media.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Info Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {selectedIndex !== null ? `${selectedIndex + 1} / ${media.length}` : ''}
                  </p>
                  {currentMedia.altText && (
                    <p className="text-xs text-gray-300 mt-1">{currentMedia.altText}</p>
                  )}
                </div>
                <span className="text-xs bg-violet-600 px-3 py-1 rounded-full">
                  {currentMedia.kind}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
