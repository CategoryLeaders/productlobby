'use client'

import React, { useState, useEffect } from 'react'
import { Lock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AchievementBadge {
  id: string
  key: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

interface AchievementBadgesProps {
  userId?: string
  showEarned?: boolean
  showLocked?: boolean
}

const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  FIRST_CAMPAIGN: {
    bg: 'from-blue-50 to-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  ACTIVE_LOBBYIST: {
    bg: 'from-purple-50 to-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  COMMUNITY_VOICE: {
    bg: 'from-green-50 to-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  TRENDSETTER: {
    bg: 'from-amber-50 to-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  EARLY_ADOPTER: {
    bg: 'from-pink-50 to-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
}

export function AchievementBadges({
  userId,
  showEarned = true,
  showLocked = true,
}: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<AchievementBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/users/achievements')
      if (!response.ok) return
      const result = await response.json()
      if (result.success) {
        setAchievements(result.data)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter achievements based on props
  const displayedAchievements = achievements.filter((badge) => {
    if (badge.earned && !showEarned) return false
    if (!badge.earned && !showLocked) return false
    return true
  })

  // Separate earned and locked
  const earnedAchievements = displayedAchievements.filter((a) => a.earned)
  const lockedAchievements = displayedAchievements.filter((a) => !a.earned)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (displayedAchievements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No achievements yet. Keep participating!</p>
      </div>
    )
  }

  const renderBadge = (badge: AchievementBadge) => {
    const colors = badgeColors[badge.key] || badgeColors.FIRST_CAMPAIGN
    const isExpanded = expandedId === badge.id
    const earnedDate = badge.earnedAt
      ? new Date(badge.earnedAt).toLocaleDateString()
      : null

    return (
      <div
        key={badge.id}
        className={cn(
          'relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer',
          badge.earned
            ? cn(
                'bg-gradient-to-br',
                colors.bg,
                colors.border,
                'hover:shadow-lg hover:scale-105'
              )
            : 'bg-gray-100 border-gray-300 opacity-60 hover:opacity-80',
          isExpanded && 'ring-2 ring-offset-2 ring-violet-400'
        )}
        onClick={() => setExpandedId(isExpanded ? null : badge.id)}
      >
        {/* Badge Content */}
        <div className="aspect-square flex flex-col items-center justify-center p-3 text-center">
          {/* Icon */}
          <span className="text-3xl mb-2 filter drop-shadow-sm">
            {badge.earned ? badge.icon : '🔒'}
          </span>

          {/* Name */}
          {!isExpanded && (
            <>
              <h3
                className={cn(
                  'text-sm font-bold leading-tight',
                  badge.earned ? colors.text : 'text-gray-600'
                )}
              >
                {badge.name}
              </h3>
            </>
          )}

          {/* Locked indicator */}
          {!badge.earned && !isExpanded && (
            <Lock className="w-3 h-3 text-gray-500 mt-1" />
          )}
        </div>

        {/* Expanded Info */}
        {isExpanded && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-3 text-center">
            <h3 className={cn('text-xs font-bold mb-1', colors.text)}>
              {badge.name}
            </h3>
            <p className="text-xs text-gray-700 mb-2">{badge.description}</p>
            {earnedDate && (
              <p className="text-xs text-gray-600">
                ✓ Earned: {earnedDate}
              </p>
            )}
            {!badge.earned && (
              <p className="text-xs text-gray-600 italic mt-1">Locked</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedAchievements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span>
            Earned Badges ({earnedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {earnedAchievements.map(renderBadge)}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-lg">🔒</span>
            Locked ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {lockedAchievements.map(renderBadge)}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Keep participating to unlock more achievements!
          </p>
        </div>
      )}
    </div>
  )
}
