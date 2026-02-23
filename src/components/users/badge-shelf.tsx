'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EarnedBadge } from '@/lib/badges/achievement-engine'
import { Spinner } from '@/components/ui/spinner'

interface BadgeShelfProps {
  handle?: string
  isOwnProfile?: boolean
}

const tierColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
}

export function BadgeShelf({ handle, isOwnProfile = false }: BadgeShelfProps) {
  const [badges, setBadges] = useState<EarnedBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true)
        setError(null)

        let url: string
        if (isOwnProfile) {
          url = '/api/user/achievements'
        } else if (handle) {
          url = `/api/user/${handle}/badges`
        } else {
          setError('No user context provided')
          setLoading(false)
          return
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch badges')
        }

        const data = await response.json()
        setBadges(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch badges')
        setBadges([])
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [handle, isOwnProfile])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        <p>Error loading badges: {error}</p>
      </div>
    )
  }

  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  if (badges.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No badges earned yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Earned Badges ({earnedBadges.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earnedBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={true} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges - only show if user's own profile */}
      {isOwnProfile && lockedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Locked Badges ({lockedBadges.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {lockedBadges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BadgeCard({ badge, earned }: { badge: EarnedBadge; earned: boolean }) {
  return (
    <Card 
      variant="interactive" 
      className={`flex flex-col items-center justify-center p-4 text-center ${!earned ? 'opacity-60' : ''}`}
      title={badge.name}
    >
      <CardContent className="flex flex-col items-center gap-3 p-0 w-full">
        {/* Icon */}
        <div
          className="text-4xl flex items-center justify-center w-12 h-12"
          style={!earned ? { filter: 'grayscale(100%)' } : {}}
        >
          {badge.icon}
        </div>

        {/* Name and Description */}
        <div>
          <h4 className="font-semibold text-xs text-gray-900 line-clamp-2">
            {badge.name}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {badge.description}
          </p>
        </div>

        {/* Category Badge */}
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium capitalize">
          {badge.category}
        </span>

        {/* Tier Badge */}
        <span 
          className="inline-block px-2 py-1 text-white text-xs rounded font-medium capitalize"
          style={{ backgroundColor: tierColors[badge.tier] }}
        >
          {badge.tier}
        </span>

        {/* Earned Status or Progress */}
        {earned ? (
          <div className="text-green-600 text-sm font-medium flex items-center gap-1 mt-2">
            <span>✓</span> Earned
          </div>
        ) : (
          <div className="w-full mt-2 space-y-2">
            <Progress 
              value={badge.currentCount} 
              max={badge.criteria.threshold}
              showPercentage
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              {badge.currentCount} / {badge.criteria.threshold}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
