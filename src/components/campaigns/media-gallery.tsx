'use client'

import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Image, ZoomIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO' | 'SKETCH' | 'MOCKUP'
  title?: string
  uploadedAt: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  campaignTitle?: string
  isLoading?: boolean
}

export function MediaGallery({
  media,
  campaignTitle = 'Campaign',
  isLoading = false,
}: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-3" />
        <p className="text-gray-600">Loading media gallery...</p>
      </div>
    )
  }

  if (!media || media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-violet-200 rounded-lg bg-violet-50">
        <Image className="w-12 h-12 text-violet-300 mb-3" />
        <p className="text-violet-700 font-medium">No media yet</p>
        <p className="text-violet-600 text-sm">Media attachments will appear here</p>
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

  // Generate color gradient based on index for placeholder
  const getGradientColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-emerald-400 to-emerald-600',
      'from-amber-400 to-amber-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-cyan-400 to-cyan-600',
    ]
    return colors[index % colors.length]
  }

  const getTypeLabel = (type: string): string => {
    return type === 'SKETCH' ? 'Sketch' : type === 'MOCKUP' ? 'Mockup' : type
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* Grid Gallery - 3-4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openLightbox(index)}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Media Preview with Gradient Placeholder */}
            <div
              className={cn(
                'relative w-full h-48 bg-gradient-to-br flex items-center justify-center',
                getGradientColor(index)
              )}
            >
              {item.url && item.type !== 'SKETCH' && item.type !== 'MOCKUP' && !item.url.includes('gradient') ? (
                item.type === 'VIDEO' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const element = e.currentTarget as HTMLElement
                      element.style.display = 'none'
                    }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || `${campaignTitle} media ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const element = e.currentTarget as HTMLElement
                      element.style.display = 'none'
                    }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <ZoomIn className="w-8 h-8 mb-2 opacity-80" />
                  <p className="text-xs font-medium opacity-80">{item.type}</p>
                </div>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                <ZoomIn className="w-6 h-6 mb-2 mx-auto" />
                <p className="text-sm font-medium">View</p>
              </div>
            </div>

            {/* Type Badge */}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
              {getTypeLabel(item.type)}
            </div>

            {/* Title if available */}
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-2">
                <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && currentMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-black rounded-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              onClick={closeLightbox}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 h-auto"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Media Display */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-gradient-to-br from-gray-900 to-black min-h-[400px]">
              {currentMedia.type === 'VIDEO' ? (
                <video
                  src={currentMedia.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  onError={(e) => {
                    const element = e.currentTarget as HTMLElement
                    element.style.display = 'none'
                  }}
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.title || 'Full view'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const element = e.currentTarget as HTMLElement
                    element.style.display = 'none'
                  }}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            {media.length > 1 && (
              <>
                <Button
                  onClick={goToPrevious}
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 h-auto"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={goToNext}
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 h-auto"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Info Footer */}
            <div className="bg-gradient-to-t from-black/90 to-black/40 p-4 text-white border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {selectedIndex !== null ? `${selectedIndex + 1} / ${media.length}` : ''}
                  </p>
                  {currentMedia.title && (
                    <p className="text-xs text-gray-300 mt-1">{currentMedia.title}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(currentMedia.uploadedAt)}</p>
                </div>
                <span className="text-xs bg-violet-600/80 px-3 py-1 rounded-full font-medium">
                  {getTypeLabel(currentMedia.type)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery
