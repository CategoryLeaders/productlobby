'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type SkeletonVariant = 'text' | 'circular' | 'rectangular'

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
          variantStyles[variant],
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width || '100%',
          height: typeof height === 'number' ? `${height}px` : height || undefined,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          ...style,
        }}
        {...props}
      >
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    )
  }
)

Skeleton.displayName = 'Skeleton'

export interface SkeletonScreenProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  lines?: number
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonScreenProps>(
  (
    {
      count = 3,
      lines = 1,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            {Array.from({ length: lines }).map((_, j) => (
              <Skeleton
                key={j}
                variant="text"
                width={j === lines - 1 ? '70%' : '100%'}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }
)

SkeletonText.displayName = 'SkeletonText'

export interface SkeletonAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  size?: number
}

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  (
    {
      count = 1,
      size = 40,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex gap-2', className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant="circular"
            width={size}
            height={size}
          />
        ))}
      </div>
    )
  }
)

SkeletonAvatar.displayName = 'SkeletonAvatar'
