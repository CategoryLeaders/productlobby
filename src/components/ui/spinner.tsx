'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'default' | 'lg'

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  (
    {
      size = 'default',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={cn('animate-spin', sizeStyles[size], className)}
        {...props}
      >
        {/* Main violet circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.25"
        />
        {/* Lime accent segment */}
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="50%" stopColor="#84CC16" />
          </linearGradient>
        </defs>
        <path
          d="M 12 2 A 10 10 0 0 1 22 12"
          stroke="url(#spinner-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    )
  }
)

Spinner.displayName = 'Spinner'
