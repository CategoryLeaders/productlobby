'use client'

import React from 'react'
import Image from 'next/image'
import { Crown, Award, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface PodiumUser {
  id: string
  avatar: string | null
  displayName: string
  handle: string | null
  score: number
  badgeLevel: string
}

interface LeaderboardPodiumProps {
  entries: PodiumUser[]
}

// ============================================================================
// POSITION CARD
// ============================================================================

interface PositionCardProps {
  position: 1 | 2 | 3
  user: PodiumUser
  height: string
}

const PositionCard = ({ position, user, height }: PositionCardProps) => {
  const medalColors = {
    1: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      accent: '#FFD700',
      icon: '🥇',
    },
    2: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      accent: '#C0C0C0',
      icon: '🥈',
    },
    3: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      accent: '#CD7F32',
      icon: '🥉',
    },
  }

  const medal = medalColors[position]
  const positionLabels = {
    1: '1st Place',
    2: '2nd Place',
    3: '3rd Place',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-4 pt-6 pb-4 rounded-lg border-2 transition-all duration-500',
        medal.bg,
        medal.border,
        'hover:shadow-lg hover:scale-105'
      )}
      style={{ borderColor: medal.accent, minHeight: height }}
    >
      {/* Medal */}
      <div className="text-3xl">{medal.icon}</div>

      {/* Avatar */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: medal.accent }}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Position Label */}
      <div className="text-xs font-bold text-gray-700 tracking-wide">
        {positionLabels[position]}
      </div>

      {/* Name & Handle */}
      <div className="text-center">
        <p className="font-bold text-gray-900 line-clamp-1">{user.displayName}</p>
        {user.handle && (
          <p className="text-xs text-gray-600">@{user.handle}</p>
        )}
      </div>

      {/* Score */}
      <div className="text-center py-2">
        <p className="text-xl font-bold" style={{ color: medal.accent }}>
          {user.score.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600">points</p>
      </div>

      {/* Badge Level */}
      <div className="text-center bg-white rounded-full px-3 py-1 border border-gray-200">
        <p className="text-xs font-semibold text-gray-700">{user.badgeLevel}</p>
      </div>
    </div>
  )
}

// ============================================================================
// LEADERBOARD PODIUM
// ============================================================================

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  // Sort to ensure positions 1, 2, 3
  const top3 = entries.slice(0, 3)

  if (top3.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-yellow-600" />
          <h2 className="text-3xl font-display font-bold text-gray-900">Hall of Fame</h2>
          <Crown className="w-6 h-6 text-yellow-600" />
        </div>
        <p className="text-gray-600">Meet our top contributors</p>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Position 2 - Left (Silver) */}
        {top3[1] && (
          <div className="md:mt-8">
            <PositionCard position={2} user={top3[1]} height="md:h-80" />
          </div>
        )}

        {/* Position 1 - Center (Gold) */}
        {top3[0] && (
          <div>
            <PositionCard position={1} user={top3[0]} height="h-96" />
          </div>
        )}

        {/* Position 3 - Right (Bronze) */}
        {top3[2] && (
          <div className="md:mt-16">
            <PositionCard position={3} user={top3[2]} height="md:h-72" />
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-violet-50 to-lime-50 rounded-lg p-6 border border-violet-200">
        {top3.map((user, idx) => (
          <div key={user.id} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {idx === 0 && <Crown className="w-4 h-4 text-yellow-600" />}
              {idx === 1 && <Award className="w-4 h-4 text-gray-400" />}
              {idx === 2 && <Zap className="w-4 h-4 text-orange-600" />}
              <span className="font-bold text-lg text-gray-900">#{idx + 1}</span>
            </div>
            <p className="font-semibold text-gray-900 line-clamp-1">{user.displayName}</p>
            <p className="text-sm text-violet-600 font-bold">{user.score.toLocaleString()} pts</p>
          </div>
        ))}
      </div>
    </div>
  )
}
