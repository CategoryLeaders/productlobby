'use client'

import React, { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  autoGrow?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      id,
      disabled = false,
      autoGrow = false,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = ref || internalRef

    useEffect(() => {
      if (autoGrow && textareaRef && 'current' in textareaRef) {
        const textarea = textareaRef.current
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
        }
      }
    }, [autoGrow, textareaRef, props.value])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoGrow) {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
      }
      props.onChange?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={textareaId}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 rounded-lg border border-gray-300 text-foreground placeholder:text-gray-400 transition-colors duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
            autoGrow && 'overflow-hidden',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
          onChange={handleInput}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
