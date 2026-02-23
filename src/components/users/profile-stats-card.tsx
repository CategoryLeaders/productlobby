'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  MessageSquare,
  Heart,
  Calendar,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserStats {
  campaignsCreated: number
  totalLobbies: number
  commentsMade: number
  followers: number
  accountAge: number
}

interface ProfileStatsCardProps {
  userId: string
  className?: string
  compact?: boolean
}

/**
 * User Profile Stats Card Component
 * Displays a compact card with user statistics
 * Shows: campaigns created, total lobbies, comments, followers, account age
 * Features a clean card layout with avatar placeholder and stat grid
 */
export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  userId,
  className,
  compact = false,
}) => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/stats`)
        if (response.ok) {
          const data: UserStats = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-4',
          !compact && 'p-6',
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg',
        !compact && 'p-6',
        compact && 'p-4',
        className
      )}
    >
      {/* Header with avatar placeholder */}
      <div className="flex items-center gap-4 mb-5">
        {/* Avatar placeholder */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
            {/* Avatar initials would go here */}
            U
          </div>
        </div>

        {/* Header info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            User Stats
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{stats.accountAge} days active</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2' : 'grid-cols-4'
      )}>
        {/* Campaigns Created */}
        <div
          className={cn(
            'bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200',
            compact && 'p-2 text-sm'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className={cn('text-blue-600', compact ? 'w-3 h-3' : 'w-4 h-4')} />
            <p className={cn('text-gray-700 font-medium', compact && 'text-xs')}>
              Campaigns
            </p>
          </div>
          <p className={cn('font-bold text-blue-600', compact ? 'text-lg' : 'text-2xl')}>
            {stats.campaignsCreated}
          </p>
        </div>

        {/* Total Lobbies */}
        <div
          className={cn(
            'bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-3 border border-violet-200',
            compact && 'p-2 text-sm'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <Users className={cn('text-violet-600', compact ? 'w-3 h-3' : 'w-4 h-4')} />
            <p className={cn('text-gray-700 font-medium', compact && 'text-xs')}>
              Lobbies
            </p>
          </div>
          <p className={cn('font-bold text-violet-600', compact ? 'text-lg' : 'text-2xl')}>
            {stats.totalLobbies}
          </p>
        </div>

        {/* Comments Made */}
        <div
          className={cn(
            'bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200',
            compact && 'p-2 text-sm'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className={cn('text-emerald-600', compact ? 'w-3 h-3' : 'w-4 h-4')} />
            <p className={cn('text-gray-700 font-medium', compact && 'text-xs')}>
              Comments
            </p>
          </div>
          <p className={cn('font-bold text-emerald-600', compact ? 'text-lg' : 'text-2xl')}>
            {stats.commentsMade}
          </p>
        </div>

        {/* Followers */}
        <div
          className={cn(
            'bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3 border border-rose-200',
            compact && 'p-2 text-sm'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <Heart className={cn('text-rose-600', compact ? 'w-3 h-3' : 'w-4 h-4')} />
            <p className={cn('text-gray-700 font-medium', compact && 'text-xs')}>
              Followers
            </p>
          </div>
          <p className={cn('font-bold text-rose-600', compact ? 'text-lg' : 'text-2xl')}>
            {stats.followers}
          </p>
        </div>
      </div>

      {/* Footer indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Active contributor</span>
        </div>
      </div>
    </div>
  )
}
