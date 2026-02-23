'use client'

import { Crown, Star, Zap, Award, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReputationBadgeProps {
  score: number
  tier: string
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
}

interface TierConfig {
  name: string
  color: string
  bgColor: string
  icon: React.ReactNode
  textColor: string
}

const TIER_CONFIG: Record<string, TierConfig> = {
  Newcomer: {
    name: 'Newcomer',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: <Star size={16} />,
    textColor: 'text-blue-900',
  },
  Contributor: {
    name: 'Contributor',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: <Zap size={16} />,
    textColor: 'text-emerald-900',
  },
  Advocate: {
    name: 'Advocate',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: <Award size={16} />,
    textColor: 'text-purple-900',
  },
  Champion: {
    name: 'Champion',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    icon: <Flame size={16} />,
    textColor: 'text-rose-900',
  },
  Legend: {
    name: 'Legend',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: <Crown size={16} />,
    textColor: 'text-amber-900',
  },
}

export function ReputationBadge({
  score,
  tier,
  size = 'md',
  showScore = true,
}: ReputationBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Newcomer

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-colors',
        config.bgColor,
        config.color,
        sizeClasses[size]
      )}
    >
      {config.icon}
      <span>{tier}</span>
      {showScore && <span className="opacity-75">({score})</span>}
    </div>
  )
}

// Compact version for profile cards
export function CompactReputationBadge({
  score,
  tier,
}: Omit<ReputationBadgeProps, 'size' | 'showScore'>) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Newcomer

  return (
    <div
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-full',
        config.bgColor,
        config.color
      )}
      title={`${tier} - ${score} points`}
    >
      {config.icon}
    </div>
  )
}

// Badge with progress bar
export function ReputationBadgeWithProgress({
  score,
  tier,
  percentToNextTier,
  nextTier,
}: ReputationBadgeProps & {
  percentToNextTier: number
  nextTier: string | null
}) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.Newcomer

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'inline-flex items-center rounded-full font-semibold px-3 py-1.5 text-sm gap-1.5',
          config.bgColor,
          config.color
        )}
      >
        {config.icon}
        <span>{tier}</span>
        <span className="opacity-75">({score})</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Progress to next tier</span>
          {nextTier && <span className="font-medium text-gray-700">{nextTier}</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${percentToNextTier}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">{Math.round(percentToNextTier)}% to next tier</div>
      </div>
    </div>
  )
}
