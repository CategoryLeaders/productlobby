'use client'

import React from 'react'
import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

type ProgressVariant = 'violet' | 'lime' | 'green'

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: ProgressVariant
  label?: string
  showPercentage?: boolean
  animated?: boolean
}

const variantStyles: Record<ProgressVariant, string> = {
  violet: 'bg-violet-600',
  lime: 'bg-lime-500',
  green: 'bg-green-500',
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'violet',
      label,
      showPercentage = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min((value / max) * 100, 100)

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {showPercentage && (
              <span className="text-sm font-medium text-gray-600">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <RadixProgress.Root
          value={value}
          max={max}
          className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        >
          <RadixProgress.Indicator
            className={cn(
              'h-full transition-all duration-300',
              animated && 'animate-pulse-subtle',
              variantStyles[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </RadixProgress.Root>
      </div>
    )
  }
)

Progress.displayName = 'Progress'
