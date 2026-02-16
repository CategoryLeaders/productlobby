'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-12 px-4',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-gray-400">
            {typeof icon === 'string' ? (
              <div className="text-5xl">{icon}</div>
            ) : (
              <div className="flex justify-center">{icon}</div>
            )}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 max-w-md mb-6">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors duration-200"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
