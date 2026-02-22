/**
 * Optimised Image component
 * Wrapper around next/image with performance enhancements:
 * - Blur placeholder (shimmer effect)
 * - Proper sizes attribute for responsive images
 * - Lazy loading by default
 * - Error fallback (shows placeholder on failure)
 */

'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useCallback } from 'react'

interface OptimisedImageProps extends Omit<ImageProps, 'onError'> {
  /**
   * Alt text (required for accessibility)
   */
  alt: string

  /**
   * Fallback placeholder to show on error or while loading
   */
  fallback?: React.ReactNode

  /**
   * Whether to show shimmer effect while loading
   */
  shimmer?: boolean

  /**
   * Color of the blur placeholder
   */
  blurColor?: string

  /**
   * Sizes attribute for responsive images
   * If not provided, defaults to responsive sizes
   */
  sizes?: string

  /**
   * Custom error handler
   */
  onImageError?: () => void
}

/**
 * Default shimmer SVG placeholder
 * Creates a smooth gradient animation effect
 */
const shimmerSvg = (width: number, height: number) => `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="shimmer" x1="0" y1="0" x2="${width}" y2="0">
      <stop offset="0%" stop-color="#f0f0f0" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f0f0f0" />
      <animate attributeName="x1" from="-${width}" to="${width * 2}" dur="2s" repeatCount="indefinite" />
      <animate attributeName="x2" from="0" to="${width * 3}" dur="2s" repeatCount="indefinite" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#shimmer)" />
</svg>
`

/**
 * Convert SVG to base64 data URL
 */
const toDataUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * Get default responsive sizes based on image context
 */
const getDefaultSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

/**
 * OptimisedImage Component
 * Enhanced Next.js Image with performance optimizations
 */
export function OptimisedImage({
  alt,
  fallback,
  shimmer = true,
  blurColor = '#f0f0f0',
  sizes,
  onImageError,
  width = 800,
  height = 600,
  priority = false,
  quality = 75,
  ...props
}: OptimisedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(!priority)

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    onImageError?.()
  }, [onImageError])

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Generate blur placeholder
  const numWidth = typeof width === 'number' ? width : 800
  const numHeight = typeof height === 'number' ? height : 600
  const blurDataUrl = shimmer
    ? toDataUrl(shimmerSvg(numWidth, numHeight))
    : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${numWidth}' height='${numHeight}'%3E%3Crect fill='${encodeURIComponent(blurColor)}' width='${numWidth}' height='${numHeight}'/%3E%3C/svg%3E`

  // Show fallback if image failed to load
  if (hasError) {
    return (
      <div
        className="bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      >
        {fallback || (
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z"
              />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Loading shimmer overlay */}
      {isLoading && shimmer && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse rounded-lg"
          style={{
            animation: 'shimmer 2s infinite',
          }}
        />
      )}

      <Image
        alt={alt}
        width={numWidth}
        height={numHeight}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={blurDataUrl}
        sizes={sizes || getDefaultSizes()}
        onError={handleError}
        onLoadingComplete={handleLoadingComplete}
        {...props}
      />

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Specific wrapper for campaign card images
 */
export function CampaignCardImage({
  src,
  alt,
  ...props
}: Omit<OptimisedImageProps, 'width' | 'height'> & {
  src?: string
}) {
  return (
    <OptimisedImage
      src={src || '/placeholder-campaign.jpg'}
      alt={alt || 'Campaign'}
      width={400}
      height={240}
      className="w-full h-60 object-cover"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  )
}

/**
 * Specific wrapper for avatar images
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  ...props
}: Omit<OptimisedImageProps, 'width' | 'height'> & {
  src?: string
  size?: number
}) {
  return (
    <OptimisedImage
      src={src || '/placeholder-avatar.jpg'}
      alt={alt || 'Avatar'}
      width={size}
      height={size}
      className="rounded-full"
      {...props}
    />
  )
}

/**
 * Specific wrapper for brand logos
 */
export function BrandLogoImage({
  src,
  alt,
  size = 48,
  ...props
}: Omit<OptimisedImageProps, 'width' | 'height'> & {
  src?: string
  size?: number
}) {
  return (
    <OptimisedImage
      src={src || '/placeholder-logo.jpg'}
      alt={alt || 'Logo'}
      width={size}
      height={size}
      className="object-contain"
      {...props}
    />
  )
}
