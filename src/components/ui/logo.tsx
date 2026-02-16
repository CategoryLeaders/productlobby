'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

export interface LogoProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: LogoSize
}

const sizeStyles: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        {...props}
      >
        <span className={cn('font-logo-word font-bold text-foreground', sizeStyles[size])}>
          product
        </span>
        <span className={cn('font-logo-accent font-bold text-logo-violet', sizeStyles[size])}>
          lobby
        </span>
      </div>
    )
  }
)

Logo.displayName = 'Logo'
