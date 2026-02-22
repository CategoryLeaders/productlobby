'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GalleryImage {
  id: string
  url: string
  alt: string
  blurDataUrl?: string
}

export interface CampaignImageGalleryProps {
  images: GalleryImage[]
  title?: string
  className?: string
}

export const CampaignImageGallery: React.FC<CampaignImageGalleryProps> = ({
  images,
  title = 'Campaign Images',
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [thumbnailScroll, setThumbnailScroll] = useState(0)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  const currentImage = images[selectedIndex]

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, selectedIndex])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen])

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrevious()
      }
    }
  }

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!thumbnailContainerRef.current) return

    const scrollAmount = 100
    const newScroll = direction === 'left'
      ? Math.max(0, thumbnailScroll - scrollAmount)
      : thumbnailScroll + scrollAmount

    thumbnailContainerRef.current.scrollLeft = newScroll
    setThumbnailScroll(newScroll)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn('w-full', className)}>
        <div className="w-full h-96 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-600 font-medium">No images yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Main Image Container */}
      <div
        className="relative w-full bg-gray-900 rounded-lg overflow-hidden mb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Aspect Ratio Container */}
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            placeholder={currentImage.blurDataUrl ? 'blur' : 'empty'}
            blurDataURL={currentImage.blurDataUrl}
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />

          {/* Gradient Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Navigation Buttons - Only show on desktop hover, always on mobile */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200 touch-target sm:opacity-0 hover:opacity-100 group z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full transition-all duration-200 touch-target sm:opacity-0 hover:opacity-100 group z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-lg transition-all duration-200 touch-target"
          aria-label="Open lightbox"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="relative">
          <div
            ref={thumbnailContainerRef}
            className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0"
          >
            <div className="flex gap-2 min-w-min">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200',
                    selectedIndex === index
                      ? 'border-violet-600'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selectedIndex === index}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Scroll hints for mobile */}
          {images.length > 4 && (
            <div className="hidden sm:flex absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-white to-transparent" />
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all duration-200 touch-target z-60"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all duration-200 touch-target"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all duration-200 touch-target"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                {/* Image Counter in Lightbox */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {selectedIndex + 1} / {images.length}
                </div>

                {/* Keyboard Navigation Hint */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-lg hidden sm:block">
                  ← → to navigate • ESC to close
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
