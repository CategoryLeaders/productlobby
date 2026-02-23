'use client'

import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface TableUser {
  id: string
  avatar: string | null
  displayName: string
  handle: string | null
  score: number
  badgeLevel: string
}

interface LeaderboardTableProps {
  entries: TableUser[]
  currentUserId?: string | null
  startRank?: number
}

// ============================================================================
// BADGE COLORS
// ============================================================================

const getBadgeVariant = (badgeLevel: string) => {
  switch (badgeLevel) {
    case 'Legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900'
    case 'Champion':
      return 'bg-purple-600 text-white'
    case 'Hero':
      return 'bg-blue-600 text-white'
    case 'Rising Star':
      return 'bg-green-600 text-white'
    case 'Contributor':
      return 'bg-gray-600 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

const getBadgeIcon = (badgeLevel: string) => {
  switch (badgeLevel) {
    case 'Legendary':
      return '⭐'
    case 'Champion':
      return '🏆'
    case 'Hero':
      return '💪'
    case 'Rising Star':
      return '🌟'
    case 'Contributor':
      return '👥'
    default:
      return '✨'
  }
}

// ============================================================================
// LEADERBOARD TABLE
// ============================================================================

export function LeaderboardTable({
  entries,
  currentUserId,
  startRank = 4,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No entries to display</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-12">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 hidden sm:table-cell">Handle</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 w-24">Points</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Badge</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((user, index) => {
            const rank = startRank + index
            const isCurrentUser = currentUserId && user.id === currentUserId
            const badgeVariant = getBadgeVariant(user.badgeLevel)
            const badgeIcon = getBadgeIcon(user.badgeLevel)

            return (
              <tr
                key={user.id}
                className={cn(
                  'border-b border-gray-200 transition-colors hover:bg-gray-50',
                  isCurrentUser && 'bg-violet-50'
                )}
              >
                {/* Rank */}
                <td className="px-4 py-4 text-left">
                  <span className="font-bold text-gray-900 text-lg">#{rank}</span>
                </td>

                {/* User Info */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.displayName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.displayName}
                        {isCurrentUser && (
                          <span className="ml-2 inline-block text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Handle */}
                <td className="px-4 py-4 text-left hidden sm:table-cell">
                  <p className="text-sm text-gray-600">
                    {user.handle ? `@${user.handle}` : '—'}
                  </p>
                </td>

                {/* Points */}
                <td className="px-4 py-4 text-right">
                  <p className="font-bold text-lg text-violet-600">
                    {user.score.toLocaleString()}
                  </p>
                </td>

                {/* Badge */}
                <td className="px-4 py-4 text-center">
                  <Badge className={cn('text-xs font-semibold', badgeVariant)}>
                    <span className="mr-1">{badgeIcon}</span>
                    {user.badgeLevel}
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
