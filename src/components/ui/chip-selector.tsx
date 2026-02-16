'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ChipOption {
  id: string | number
  label: string
}

export interface ChipSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ChipOption[]
  selected: (string | number)[]
  onChange: (selected: (string | number)[]) => void
  label?: string
  multiple?: boolean
}

export const ChipSelector = React.forwardRef<HTMLDivElement, ChipSelectorProps>(
  (
    {
      options,
      selected,
      onChange,
      label,
      multiple = true,
      className,
      ...props
    },
    ref
  ) => {
    const handleChipClick = (optionId: string | number) => {
      if (multiple) {
        const newSelected = selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId]
        onChange(newSelected)
      } else {
        onChange(selected.includes(optionId) ? [] : [optionId])
      }
    }

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {label && (
          <label className="block text-sm font-medium text-foreground mb-3">
            {label}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.id)
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick(option.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md hover:bg-violet-700'
                    : 'bg-gray-100 text-foreground border border-gray-300 hover:border-violet-500 hover:bg-gray-50'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }
)

ChipSelector.displayName = 'ChipSelector'
