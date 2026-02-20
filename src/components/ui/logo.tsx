'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

export interface LogoProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: LogoSize
  showIcon?: boolean
}

const sizeStyles: Record<LogoSize, { text: string; icon: number; gap: string }> = {
  sm: { text: 'text-lg', icon: 22, gap: 'gap-1.5' },
  md: { text: 'text-2xl', icon: 28, gap: 'gap-2' },
  lg: { text: 'text-4xl', icon: 40, gap: 'gap-2.5' },
}

const MegaphoneIcon: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Megaphone body - bolder, more confident shape */}
    <path
      d="M24 4C24 4 18.5 7.5 10.5 7.5H7C5.34315 7.5 4 8.84315 4 10.5V13.5C4 15.1569 5.34315 16.5 7 16.5H10.5C18.5 16.5 24 20 24 20V4Z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M24 4C24 4 18.5 7.5 10.5 7.5H7C5.34315 7.5 4 8.84315 4 10.5V13.5C4 15.1569 5.34315 16.5 7 16.5H10.5C18.5 16.5 24 20 24 20V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sound wave 1 */}
    <path
      d="M26.5 8.5C27.5 10 28 12 28 12C28 12 27.5 14 26.5 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Sound wave 2 - adds energy */}
    <path
      d="M28.5 6C30 8.5 30.5 12 30.5 12C30.5 12 30 15.5 28.5 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Handle */}
    <path
      d="M8 16.5V21C8 22.1046 8.89543 23 10 23H11.5C12.6046 23 13.5 22.1046 13.5 21V16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Accent dot - lime energy */}
    <circle cx="24" cy="12" r="2" fill="currentColor" opacity="0.4" />
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
        className={cn('flex items-center', styles.gap, className)}
        {...props}
      >
        {showIcon && (
          <MegaphoneIcon size={styles.icon} className="text-logo-violet flex-shrink-0" />
        )}
        <div className="flex items-baseline gap-px">
          <span className={cn('font-logo-word font-semibold text-foreground tracking-tight', styles.text)}>
            product
          </span>
          <span className={cn('font-logo-accent font-bold text-logo-violet tracking-tight', styles.text)}>
            lobby
          </span>
        </div>
      </div>
    )
  }
)

Logo.displayName = 'Logo'
