/**
 * Reusable Skeleton component for loading states
 * Provides animated placeholder UI with pulse effect
 */

import React from 'react'

interface SkeletonProps {
  className?: string
  /**
   * Skeleton variant:
   * - 'line': Single line of text
   * - 'block': Block of content
   * - 'circle': Circular avatar
   * - 'button': Button-sized skeleton
   */
  variant?: 'line' | 'block' | 'circle' | 'button'
  width?: string | number
  height?: string | number
  count?: number
}

/**
 * Skeleton component with animated pulse
 */
export function Skeleton({
  className = '',
  variant = 'block',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const getVariantClasses = (v: string): string => {
    switch (v) {
      case 'line':
        return 'h-4 rounded'
      case 'block':
        return 'h-20 rounded-lg'
      case 'circle':
        return 'rounded-full'
      case 'button':
        return 'h-10 rounded-lg'
      default:
        return 'h-4 rounded'
    }
  }

  const defaultHeight = variant === 'circle' ? '40px' : variant === 'button' ? '40px' : '16px'
  const defaultWidth = variant === 'circle' ? '40px' : '100%'

  const finalWidth = width ?? defaultWidth
  const finalHeight = height ?? defaultHeight

  const skeletonItem = (
    <div
      className={`${getVariantClasses(variant)} bg-gray-200 animate-pulse ${className}`}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      }}
      role="status"
      aria-label="Loading"
    />
  )

  if (count === 1) {
    return skeletonItem
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonItem}</div>
      ))}
    </div>
  )
}

/**
 * Skeleton for campaign card
 */
export function CampaignCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      {/* Image skeleton */}
      <Skeleton variant="block" height="192px" className="w-full" />

      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton variant="line" width="80%" />
        <Skeleton variant="line" width="60%" />

        {/* Description skeleton */}
        <div className="space-y-2 pt-2">
          <Skeleton variant="line" width="100%" />
          <Skeleton variant="line" width="90%" />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between items-center pt-3">
          <Skeleton variant="circle" width="32px" height="32px" />
          <Skeleton variant="line" width="60px" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for campaign list grid
 */
export function CampaignGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for profile page
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Avatar and name */}
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width="80px" height="80px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" width="40%" />
            <Skeleton variant="line" width="30%" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Skeleton variant="line" width="100%" />
          <Skeleton variant="line" width="80%" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="line" width="100%" />
            <Skeleton variant="line" width="80%" />
          </div>
        ))}
      </div>

      {/* Campaigns list */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="block" height="60px" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for admin dashboard
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
            <Skeleton variant="line" width="60%" />
            <Skeleton variant="line" width="40%" height="28px" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="block" height="300px" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 space-y-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="line" width="100%" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for detailed page (campaign, brand, etc)
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero image */}
      <Skeleton variant="block" height="400px" className="w-full rounded-lg" />

      {/* Title and metadata */}
      <div className="space-y-4">
        <Skeleton variant="line" width="60%" height="32px" />
        <div className="flex gap-2">
          <Skeleton variant="line" width="100px" />
          <Skeleton variant="line" width="100px" />
          <Skeleton variant="line" width="100px" />
        </div>
      </div>

      {/* Content sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton variant="line" width="30%" height="24px" />
          <div className="space-y-2">
            <Skeleton variant="line" width="100%" />
            <Skeleton variant="line" width="100%" />
            <Skeleton variant="line" width="90%" />
          </div>
        </div>
      ))}
    </div>
  )
}
