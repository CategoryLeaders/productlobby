'use client'

import React from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: AvatarSize
  fallbackClassName?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-lg',
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      initials,
      size = 'md',
      className,
      fallbackClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('inline-block', className)}
        {...props}
      >
        <RadixAvatar.Root className={cn(
          'inline-flex items-center justify-center rounded-full bg-violet-100 overflow-hidden',
          sizeStyles[size]
        )}>
          {src && (
            <RadixAvatar.Image
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
            />
          )}
          <RadixAvatar.Fallback
            className={cn(
              'flex items-center justify-center font-semibold text-violet-800 bg-violet-100',
              fallbackClassName
            )}
            delayMs={600}
          >
            {initials || alt.charAt(0)}
          </RadixAvatar.Fallback>
        </RadixAvatar.Root>
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
