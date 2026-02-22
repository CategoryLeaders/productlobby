'use client'

import React from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'default' | 'lg'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  initials?: string
  size?: AvatarSize
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  default: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      initials,
      size = 'default',
      className,
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
            className="flex items-center justify-center font-semibold text-violet-700 bg-violet-100 h-full w-full"
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

export { RadixAvatar }
