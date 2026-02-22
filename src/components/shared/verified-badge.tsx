/**
 * Verified Brand Badge Component
 * Displays verification status with appropriate styling and tooltip
 */

'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { VerificationStatus } from '@/lib/brand-verification'

interface VerifiedBadgeProps {
  status: VerificationStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function VerifiedBadge({
  status,
  size = 'md',
  showLabel = false,
  className = '',
}: VerifiedBadgeProps) {
  // Determine styling based on verification status
  let bgColor = 'bg-gray-100'
  let textColor = 'text-gray-600'
  let borderColor = 'border-gray-300'
  let checkColor = 'text-gray-500'
  let tooltipText = 'Not verified'
  let badgeLabel = ''

  switch (status) {
    case 'FULLY_VERIFIED':
      bgColor = 'bg-blue-50'
      textColor = 'text-blue-700'
      borderColor = 'border-blue-200'
      checkColor = 'text-blue-600'
      tooltipText = 'Brand verified - email and domain ownership confirmed'
      badgeLabel = 'Verified Brand'
      break
    case 'EMAIL_VERIFIED':
      bgColor = 'bg-yellow-50'
      textColor = 'text-yellow-700'
      borderColor = 'border-yellow-200'
      checkColor = 'text-yellow-600'
      tooltipText = 'Email verified - awaiting domain ownership confirmation'
      badgeLabel = 'Email Verified'
      break
    case 'DOMAIN_VERIFIED':
      bgColor = 'bg-lime-50'
      textColor = 'text-lime-700'
      borderColor = 'border-lime-200'
      checkColor = 'text-lime-600'
      tooltipText = 'Domain verified - awaiting email confirmation'
      badgeLabel = 'Domain Verified'
      break
    case 'REJECTED':
      bgColor = 'bg-red-50'
      textColor = 'text-red-700'
      borderColor = 'border-red-200'
      checkColor = 'text-red-600'
      tooltipText = 'Verification rejected - please try again'
      badgeLabel = 'Verification Failed'
      break
    case 'PENDING':
    default:
      bgColor = 'bg-gray-100'
      textColor = 'text-gray-600'
      borderColor = 'border-gray-300'
      checkColor = 'text-gray-500'
      tooltipText = 'Verification in progress'
      badgeLabel = 'Pending'
      break
  }

  // Size mappings
  let sizeClasses = 'w-5 h-5'
  let paddingClasses = 'px-2 py-1'
  let textSizeClasses = 'text-xs'

  if (size === 'sm') {
    sizeClasses = 'w-4 h-4'
    paddingClasses = 'px-1.5 py-0.5'
    textSizeClasses = 'text-xs'
  } else if (size === 'lg') {
    sizeClasses = 'w-6 h-6'
    paddingClasses = 'px-3 py-1.5'
    textSizeClasses = 'text-sm'
  }

  return (
    <div
      className={`relative inline-flex items-center gap-1 ${paddingClasses} ${bgColor} ${borderColor} border rounded-full group cursor-help ${className}`}
      title={tooltipText}
    >
      <Check className={`${sizeClasses} ${checkColor}`} />
      {showLabel && <span className={`${textSizeClasses} ${textColor} font-medium`}>{badgeLabel}</span>}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {tooltipText}
      </div>
    </div>
  )
}

/**
 * Alternative inline badge with text
 */
export function VerifiedBadgeInline({
  status,
  className = '',
}: Omit<VerifiedBadgeProps, 'size' | 'showLabel'>) {
  return <VerifiedBadge status={status} size="md" showLabel={true} className={className} />
}
