'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

export interface LogoProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: LogoSize
  showIcon?: boolean
}

const sizeStyles: Record<LogoSize, { text: string; icon: number }> = {
  sm: { text: 'text-lg', icon: 20 },
  md: { text: 'text-2xl', icon: 26 },
  lg: { text: 'text-4xl', icon: 36 },
}

const MegaphoneIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Megaphone body */}
    <path
      d="M18 3C18 3 14 6 8 6H5C3.89543 6 3 6.89543 3 8V10C3 11.1046 3.89543 12 5 12H8C14 12 18 15 18 15V3Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M18 3C18 3 14 6 8 6H5C3.89543 6 3 6.89543 3 8V10C3 11.1046 3.89543 12 5 12H8C14 12 18 15 18 15V3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sound waves */}
    <path
      d="M20.5 7C21.1 8 21.5 9 21.5 9C21.5 9 21.1 10 20.5 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Handle */}
    <path
      d="M6 12V15C6 16.1046 6.89543 17 8 17H9C10.1046 17 11 16.1046 11 15V12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      size = 'md',
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size]

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1.5', className)}
        {...props}
      >
        {showIcon && (
          <MegaphoneIcon size={styles.icon} className="text-logo-violet flex-shrink-0" />
        )}
        <div className="flex items-center gap-0.5">
          <span className={cn('font-logo-word font-medium text-foreground', styles.text)}>
            product
          </span>
          <span className={cn('font-logo-accent font-bold text-logo-violet', styles.text)}>
            lobby
          </span>
        </div>
      </div>
    )
  }
)

Logo.displayName = 'Logo'
