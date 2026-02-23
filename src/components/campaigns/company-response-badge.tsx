'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Clock, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyResponseBadgeProps {
  responseType?: 'committed' | 'investigating' | 'acknowledged' | 'declined' | 'no_response'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CompanyResponseBadge({
  responseType = 'no_response',
  showLabel = true,
  size = 'md',
  className,
}: CompanyResponseBadgeProps) {
  const badgeConfig = {
    committed: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      label: 'Company Committed',
      description: 'Company has committed to action',
    },
    investigating: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      label: 'Under Investigation',
      description: 'Company is investigating',
    },
    acknowledged: {
      icon: AlertCircle,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      label: 'Acknowledged',
      description: 'Company acknowledged the request',
    },
    declined: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      label: 'Request Declined',
      description: 'Company declined the request',
    },
    no_response: {
      icon: HelpCircle,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      label: 'No Response',
      description: 'No response from company yet',
    },
  }

  const config = badgeConfig[responseType]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200',
        sizeClasses[size],
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
      title={config.description}
    >
      <Icon className={iconSizeClasses[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}
