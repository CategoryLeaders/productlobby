'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/shared'
import { BadgeShelf } from '@/components/users/badge-shelf'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EarnedBadge } from '@/lib/badges/achievement-engine'

type FilterType = 'all' | 'earned' | 'locked'

interface AchievementStats {
  earned: number
  total: number
  percentage: number
  byTier: {
    bronze: number
    silver: number
    gold: number
    platinum: number
  }
  byCategory: {
    campaigning: number
    lobbying: number
    community: number
    special: number
  }
}

export default function AchievementsPage() {
  const [badges, setBadges] = useState<EarnedBadge[]>([])
  const [stats, setStats] = useState<AchievementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/achievements')
        if (!response.ok) {
          throw new Error('Failed to fetch achievements')
        }

        const data = await response.json()
        const allBadges = data.data || []
        setBadges(allBadges)

        // Calculate stats
        const earned = allBadges.filter((b: EarnedBadge) => b.earned).length
        const total = allBadges.length

        const byTier = {
          bronze: allBadges.filter((b: EarnedBadge) => b.tier === 'bronze' && b.earned).length,
          silver: allBadges.filter((b: EarnedBadge) => b.tier === 'silver' && b.earned).length,
          gold: allBadges.filter((b: EarnedBadge) => b.tier === 'gold' && b.earned).length,
          platinum: allBadges.filter((b: EarnedBadge) => b.tier === 'platinum' && b.earned).length
        }

        const byCategory = {
          campaigning: allBadges.filter((b: EarnedBadge) => b.category === 'campaigning' && b.earned).length,
          lobbying: allBadges.filter((b: EarnedBadge) => b.category === 'lobbying' && b.earned).length,
          community: allBadges.filter((b: EarnedBadge) => b.category === 'community' && b.earned).length,
          special: allBadges.filter((b: EarnedBadge) => b.category === 'special' && b.earned).length
        }

        setStats({
          earned,
          total,
          percentage: Math.round((earned / total) * 100),
          byTier,
          byCategory
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  if (loading) {
    return (
      <DashboardLayout role="supporter">
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="supporter">
        <div className="text-center text-red-600 py-8">
          <p>Error loading achievements: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const earnedBadges = badges.filter(b => b.earned)
  const lockedBadges = badges.filter(b => !b.earned)

  const filteredBadges = filter === 'all'
    ? badges
    : filter === 'earned'
      ? earnedBadges
      : lockedBadges

  const badgesByCategory = {
    campaigning: filteredBadges.filter(b => b.category === 'campaigning'),
    lobbying: filteredBadges.filter(b => b.category === 'lobbying'),
    community: filteredBadges.filter(b => b.category === 'community'),
    special: filteredBadges.filter(b => b.category === 'special')
  }

  return (
    <DashboardLayout role="supporter">
      {/* Page Header */}
      <PageHeader
        title="Achievements"
        description="Track your progress and earn badges as you grow your ProductLobby presence"
      />

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Overall Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600 mb-1">
                  {stats.earned}/{stats.total}
                </div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{stats.percentage}% Complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Tier Breakdown */}
          {(
            ['bronze', 'silver', 'gold', 'platinum'] as const
          ).map((tier) => (
            <Card key={tier}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {tier === 'bronze' && '🥉'}
                    {tier === 'silver' && '🥈'}
                    {tier === 'gold' && '🥇'}
                    {tier === 'platinum' && '👑'}
                  </div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {stats.byTier[tier]}
                  </div>
                  <p className="text-xs text-gray-600 capitalize">{tier}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Category Stats */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Achievement Breakdown</CardTitle>
            <CardDescription>Badges earned by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Campaigning</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byCategory.campaigning}/3</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lobbying</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byCategory.lobbying}/4</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Community</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byCategory.community}/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Special</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byCategory.special}/3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({badges.length})
        </Button>
        <Button
          variant={filter === 'earned' ? 'primary' : 'outline'}
          onClick={() => setFilter('earned')}
          size="sm"
        >
          Earned ({earnedBadges.length})
        </Button>
        <Button
          variant={filter === 'locked' ? 'primary' : 'outline'}
          onClick={() => setFilter('locked')}
          size="sm"
        >
          Locked ({lockedBadges.length})
        </Button>
      </div>

      {/* Badges by Category */}
      <div className="space-y-12">
        {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          categoryBadges.length > 0 && (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 capitalize">
                {category} ({categoryBadges.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryBadges.map(badge => (
                  <BadgeCardItem key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </DashboardLayout>
  )
}

function BadgeCardItem({ badge }: { badge: EarnedBadge }) {
  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  }

  return (
    <Card
      variant="interactive"
      className={`flex flex-col items-center justify-center p-4 text-center ${!badge.earned ? 'opacity-60' : ''}`}
      title={badge.name}
    >
      <CardContent className="flex flex-col items-center gap-3 p-0 w-full">
        {/* Icon */}
        <div
          className="text-4xl flex items-center justify-center w-12 h-12"
          style={!badge.earned ? { filter: 'grayscale(100%)' } : {}}
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

        {/* Tier Badge */}
        <span
          className="inline-block px-2 py-1 text-white text-xs rounded font-medium capitalize"
          style={{ backgroundColor: tierColors[badge.tier] }}
        >
          {badge.tier}
        </span>

        {/* Status */}
        {badge.earned ? (
          <div className="text-green-600 text-sm font-medium flex items-center gap-1 mt-2">
            <span>✓</span> Earned
          </div>
        ) : (
          <div className="text-gray-600 text-xs mt-2">
            {badge.currentCount}/{badge.criteria.threshold}
          </div>
        )}
      </CardContent>
    </Card>
  )
}