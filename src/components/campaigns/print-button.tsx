'use client'

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrintButtonProps {
  campaignSlug: string
  variant?: 'default' | 'minimal' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PrintButton({
  campaignSlug,
  variant = 'default',
  size = 'md',
  className,
}: PrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = async () => {
    setIsLoading(true)
    try {
      // Navigate to the print page
      const printWindow = window.open(
        `/campaigns/${campaignSlug}/print`,
        '_blank',
        'width=900,height=1000'
      )

      if (printWindow) {
        // Wait for page to load before printing
        printWindow.addEventListener('load', () => {
          printWindow.focus()
          printWindow.print()
        })
      }
    } catch (error) {
      console.error('Error opening print page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    default:
      'bg-violet-600 text-white hover:bg-violet-700 active:scale-95 shadow-sm',
    minimal:
      'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-violet-600',
    outline:
      'border border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  }

  return (
    <button
      onClick={handlePrint}
      disabled={isLoading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      title="Open print view and print campaign"
      aria-label="Print campaign"
    >
      <Printer size={iconSize[size]} />
      {!isLoading ? 'Print' : 'Loading...'}
    </button>
  )
}
