'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onChange, disabled = false, label, description }, ref) => {
    return (
      <div className="flex items-start justify-between gap-4">
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label className="block text-sm font-medium text-gray-900 mb-1">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}
        <button
          ref={ref}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-violet-600' : 'bg-gray-300'
          )}
          role="switch"
          aria-checked={checked}
          type="button"
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
              checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'

export { ToggleSwitch }
