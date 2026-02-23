'use client'

import React, { useState, useEffect } from 'react'
import { Badge, BadgeCheckIcon, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

type VerificationLevel = 'unverified' | 'basic' | 'verified' | 'premium'

interface VerificationData {
  level: VerificationLevel
  hasEnoughLobbies: boolean
  creatorHasVerifiedEmail: boolean
  hasGoodDescription: boolean
  hasTargetedBrand: boolean
  score: number
}

interface CampaignVerificationBadgeProps {
  campaignId: string
  size?: 'sm' | 'md' | 'lg'
}

const badgeConfig: Record<VerificationLevel, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  unverified: {
    label: 'Unverified',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: <Shield className="w-3 h-3" />,
  },
  basic: {
    label: 'Basic',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <BadgeCheckIcon className="w-3 h-3" />,
  },
  verified: {
    label: 'Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: <BadgeCheckIcon className="w-3 h-3" />,
  },
  premium: {
    label: 'Premium',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <Badge className="w-3 h-3" />,
  },
}

export function CampaignVerificationBadge({
  campaignId,
  size = 'sm',
}: CampaignVerificationBadgeProps) {
  const [data, setData] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    fetchVerificationData()
  }, [campaignId])

  const fetchVerificationData = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/verification`)
      if (!response.ok) return
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching verification data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) return null

  const config = badgeConfig[data.level]
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const tooltipContent = (
    <div className="text-xs space-y-1 max-w-xs">
      <p className="font-semibold">{config.label} Verification</p>
      <ul className="space-y-0.5 text-gray-700">
        <li className={data.hasEnoughLobbies ? 'text-green-600' : 'text-gray-500'}>
          {data.hasEnoughLobbies ? '✓' : '○'} 50+ lobbies ({data.hasEnoughLobbies ? 'Met' : 'Missing'})
        </li>
        <li className={data.creatorHasVerifiedEmail ? 'text-green-600' : 'text-gray-500'}>
          {data.creatorHasVerifiedEmail ? '✓' : '○'} Creator verified email ({data.creatorHasVerifiedEmail ? 'Met' : 'Missing'})
        </li>
        <li className={data.hasGoodDescription ? 'text-green-600' : 'text-gray-500'}>
          {data.hasGoodDescription ? '✓' : '○'} Description 100+ chars ({data.hasGoodDescription ? 'Met' : 'Missing'})
        </li>
        <li className={data.hasTargetedBrand ? 'text-green-600' : 'text-gray-500'}>
          {data.hasTargetedBrand ? '✓' : '○'} Targeted brand ({data.hasTargetedBrand ? 'Met' : 'Missing'})
        </li>
      </ul>
      <p className="pt-1 text-gray-600">Score: {data.score}/4</p>
    </div>
  )

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold transition-all',
          sizeClasses[size],
          config.bgColor,
          config.color,
          'cursor-help'
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {config.icon}
        {size !== 'sm' && <span>{config.label}</span>}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-gray-900 text-white rounded-lg p-3 shadow-lg">
          {tooltipContent}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}
