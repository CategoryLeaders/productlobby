'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Award,
  Star,
  Zap,
  Target,
  Heart,
  Lightbulb,
  Compass,
  Crown,
  Rocket,
  Loader2,
  Share2,
  Lock,
} from 'lucide-react'

// Badge definitions
const BADGE_DEFINITIONS = [
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'First 100 supporters',
    criteria: 'Be among the first 100 to support',
    rarity: 'Legendary',
    icon: Rocket,
    emoji: '🚀',
    pointsRequired: 0,
  },
  {
    id: 'advocate',
    name: 'Advocate',
    description: 'Share with 5+ people',
    criteria: 'Share campaign 5 or more times',
    rarity: 'Epic',
    icon: Share2,
    emoji: '📢',
    pointsRequired: 50,
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Bring 10+ supporters',
    criteria: 'Refer 10 people to the campaign',
    rarity: 'Epic',
    icon: Compass,
    emoji: '🔗',
    pointsRequired: 100,
  },
  {
    id: 'strategist',
    name: 'Strategist',
    description: '5+ thoughtful comments',
    criteria: 'Leave 5 or more constructive comments',
    rarity: 'Rare',
    icon: Target,
    emoji: '🎯',
    pointsRequired: 60,
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help 3+ other supporters',
    criteria: 'Engage helpfully with 3+ other community members',
    rarity: 'Rare',
    icon: Heart,
    emoji: '🤝',
    pointsRequired: 75,
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Share original content',
    criteria: 'Create and share original content for campaign',
    rarity: 'Rare',
    icon: Lightbulb,
    emoji: '💡',
    pointsRequired: 80,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Track for 30 days',
    criteria: 'Follow and track campaign for 30 consecutive days',
    rarity: 'Uncommon',
    icon: Award,
    emoji: '📊',
    pointsRequired: 40,
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Top 10% engagement',
    criteria: 'Achieve top 10% engagement score',
    rarity: 'Uncommon',
    icon: Crown,
    emoji: '👑',
    pointsRequired: 90,
  },
  {
    id: 'visionary',
    name: 'Visionary',
    description: 'Suggest winning feature',
    criteria: 'Propose a feature that gets 100+ upvotes',
    rarity: 'Uncommon',
    icon: Star,
    emoji: '✨',
    pointsRequired: 70,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Become a Super Supporter',
    criteria: 'Earn all other badges and reach 500+ points',
    rarity: 'Common',
    icon: Zap,
    emoji: '⚡',
    pointsRequired: 500,
  },
]

interface Badge {
  id: string
  name: string
  description: string
  criteria: string
  rarity: string
  emoji: string
  isEarned: boolean
  earnedAt?: string
  progress?: number
  progressMax?: number
}

interface RecentlyEarned {
  id: string
  name: string
  emoji: string
  earnedAt: string
}

interface SupporterBadgesProps {
  campaignId: string
  className?: string
}

export function SupporterBadges({
  campaignId,
  className,
}: SupporterBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [recentlyEarned, setRecentlyEarned] = useState<RecentlyEarned[]>([])
  const [totalEarned, setTotalEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/campaigns/${campaignId}/supporter-badges`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch badges')
        }
        const data = await response.json()
        setBadges(data.badges)
        setRecentlyEarned(data.recentlyEarned || [])
        setTotalEarned(data.totalEarned || 0)
      } catch (err) {
        console.error('Error fetching badges:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load badges'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBadges()
  }, [campaignId])

  const handleShareBadge = (badge: Badge) => {
    setSelectedBadge(badge)
    setShareModalOpen(true)

    // Share to social media
    const text = `I just earned the ${badge.name} badge on ProductLobby! 🎉 Support amazing products and campaigns with me!`
    const url = window.location.href

    if (navigator.share) {
      navigator.share({
        title: `ProductLobby - ${badge.name} Badge`,
        text: text,
        url: url,
      })
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'from-yellow-400 to-orange-500'
      case 'Epic':
        return 'from-purple-500 to-pink-500'
      case 'Rare':
        return 'from-blue-400 to-cyan-400'
      case 'Uncommon':
        return 'from-green-400 to-emerald-400'
      default:
        return 'from-gray-300 to-gray-400'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'border-yellow-400'
      case 'Epic':
        return 'border-purple-500'
      case 'Rare':
        return 'border-blue-400'
      case 'Uncommon':
        return 'border-green-400'
      default:
        return 'border-gray-300'
    }
  }

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 bg-white p-8',
          className
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-lg border border-red-200 bg-red-50 p-4 text-red-700',
          className
        )}
      >
        <p>Error loading badges: {error}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header with stats */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Campaign Supporter Badges
        </h2>
        <p className="text-gray-600">
          Earn collectible badges as you support and engage with this campaign
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="rounded-lg bg-blue-50 px-4 py-2">
            <span className="font-semibold text-blue-900">
              {totalEarned}/{BADGE_DEFINITIONS.length}
            </span>
            <span className="ml-2 text-blue-700">badges earned</span>
          </div>
        </div>
      </div>

      {/* Recently Earned Section */}
      {recentlyEarned.length > 0 && (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-900">
            Recently Earned
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {recentlyEarned.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 text-center"
              >
                <div className="text-4xl">{badge.emoji}</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {badge.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          All Available Badges
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                'relative rounded-xl border-2 p-6 transition-all duration-200',
                badge.isEarned
                  ? `border-${getRarityBorder(badge.rarity)} bg-gradient-to-br ${getRarityColor(badge.rarity)} text-white shadow-lg hover:shadow-xl`
                  : 'border-gray-200 bg-gray-50 text-gray-600 grayscale hover:bg-gray-100'
              )}
            >
              {/* Lock icon for locked badges */}
              {!badge.isEarned && (
                <div className="absolute right-3 top-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              )}

              {/* Badge content */}
              <div className="mb-4 text-5xl">{badge.emoji}</div>

              <h4 className="mb-1 text-lg font-bold">{badge.name}</h4>

              <p className="mb-3 text-sm opacity-90">{badge.description}</p>

              <p className="mb-4 text-xs leading-relaxed">
                <span className="font-semibold">Criteria:</span> {badge.criteria}
              </p>

              {/* Rarity badge */}
              <div className="mb-4 inline-block rounded-full bg-black/20 px-3 py-1 text-xs font-medium">
                {badge.rarity}
              </div>

              {/* Progress bar (if available and not earned) */}
              {badge.progress !== undefined &&
                badge.progressMax !== undefined &&
                !badge.isEarned && (
                  <div className="mb-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {badge.progress}/{badge.progressMax}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/20">
                      <div
                        className="h-full rounded-full bg-white/50 transition-all duration-300"
                        style={{
                          width: `${(badge.progress / badge.progressMax) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Share button */}
              {badge.isEarned && (
                <Button
                  onClick={() => handleShareBadge(badge)}
                  variant="secondary"
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}

              {/* Locked indicator */}
              {!badge.isEarned && (
                <Button
                  disabled
                  variant="secondary"
                  size="sm"
                  className="w-full opacity-50"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Locked
                </Button>
              )}

              {/* Earned date */}
              {badge.isEarned && badge.earnedAt && (
                <p className="mt-3 text-xs opacity-75">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge Collection Stats */}
      <div className="grid gap-4 rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">Total Earned</p>
          <p className="text-2xl font-bold text-blue-900">{totalEarned}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">Available</p>
          <p className="text-2xl font-bold text-indigo-900">
            {BADGE_DEFINITIONS.length}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">Completion</p>
          <p className="text-2xl font-bold text-purple-900">
            {totalEarned > 0
              ? Math.round((totalEarned / BADGE_DEFINITIONS.length) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <h4 className="mb-2 font-semibold text-gray-900">
          Want to earn more badges?
        </h4>
        <p className="mb-4 text-sm text-gray-600">
          Share this campaign, leave thoughtful comments, and engage with the
          community to unlock all available badges.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Share2 className="mr-2 h-4 w-4" />
          Share Campaign
        </Button>
      </div>
    </div>
  )
}
