'use client'

import React from 'react'
import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      label,
      showPercentage = false,
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
          className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"
        >
          <RadixProgress.Indicator
            className="h-full bg-violet-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </RadixProgress.Root>
      </div>
    )
  }
)

Progress.displayName = 'Progress'
