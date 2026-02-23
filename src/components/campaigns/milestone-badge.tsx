'use client'

import React from 'react'
import { Target, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MilestoneBadgeProps {
  lobbyCount: number
  commentCount?: number
  compact?: boolean
}

const getMilestoneBadges = (
  lobbyCount: number,
  commentCount?: number
): Array<{ icon: React.ReactNode; label: string; color: string }> => {
  const badges: Array<{ icon: React.ReactNode; label: string; color: string }> = []

  // Lobby milestones
  if (lobbyCount >= 1000) {
    badges.push({
      icon: <Sparkles className="w-4 h-4" />,
      label: '🎯 1000 lobbies reached!',
      color: 'bg-violet-100 text-violet-800 border-violet-300',
    })
  } else if (lobbyCount >= 500) {
    badges.push({
      icon: <Target className="w-4 h-4" />,
      label: '🎯 500 lobbies reached!',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    })
  } else if (lobbyCount >= 250) {
    badges.push({
      icon: <Target className="w-4 h-4" />,
      label: '🎯 250 lobbies reached!',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    })
  } else if (lobbyCount >= 100) {
    badges.push({
      icon: <Target className="w-4 h-4" />,
      label: '🎯 100 lobbies reached!',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    })
  } else if (lobbyCount >= 50) {
    badges.push({
      icon: <Target className="w-4 h-4" />,
      label: '🎯 50 lobbies reached!',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    })
  }

  // Comment milestones
  if (commentCount !== undefined) {
    if (commentCount >= 100) {
      badges.push({
        icon: <Sparkles className="w-4 h-4" />,
        label: '💬 100 comments reached!',
        color: 'bg-lime-100 text-lime-800 border-lime-300',
      })
    } else if (commentCount >= 50) {
      badges.push({
        icon: <Sparkles className="w-4 h-4" />,
        label: '💬 50 comments reached!',
        color: 'bg-lime-100 text-lime-800 border-lime-300',
      })
    } else if (commentCount >= 25) {
      badges.push({
        icon: <Sparkles className="w-4 h-4" />,
        label: '💬 25 comments reached!',
        color: 'bg-lime-50 text-lime-700 border-lime-200',
      })
    } else if (commentCount >= 10) {
      badges.push({
        icon: <Sparkles className="w-4 h-4" />,
        label: '💬 10 comments reached!',
        color: 'bg-lime-50 text-lime-700 border-lime-200',
      })
    } else if (commentCount >= 5) {
      badges.push({
        icon: <Sparkles className="w-4 h-4" />,
        label: '💬 5 comments reached!',
        color: 'bg-lime-50 text-lime-700 border-lime-200',
      })
    }
  }

  return badges
}

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  lobbyCount,
  commentCount,
  compact = false,
}) => {
  const badges = getMilestoneBadges(lobbyCount, commentCount)

  if (badges.length === 0) {
    return null
  }

  if (compact) {
    // Compact display - show only the highest milestone
    const highestBadge = badges[badges.length - 1]
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium',
          highestBadge.color
        )}
      >
        {highestBadge.icon}
        <span className="truncate">{highestBadge.label}</span>
      </div>
    )
  }

  // Full display - show all milestones
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <div
          key={index}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-medium',
            badge.color
          )}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  )
}
