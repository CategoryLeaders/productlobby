'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Flame,
  Award,
  Star,
  Trophy,
  Crown,
  Zap,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface GamificationData {
  userId: string
  totalXP: number
  currentLevel: string
  currentLevelThreshold: number
  nextLevelThreshold: number
  xpProgress: number
  currentStreak: number
  lastContributionDate: string | null
  earnedBadges: Badge[]
  lockedBadges: Badge[]
  recentXPGains: XPGain[]
  leaderboard: LeaderboardEntry[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: string
}

interface XPGain {
  id: string
  eventType: string
  points: number
  createdAt: string
}

interface LeaderboardEntry {
  userId: string
  displayName: string
  avatar?: string
  totalXP: number
  level: string
}

// ============================================================================
// LEVEL DEFINITIONS
// ============================================================================

const LEVELS = [
  { name: 'Newcomer', threshold: 0, color: 'from-slate-400 to-slate-600' },
  { name: 'Contributor', threshold: 100, color: 'from-blue-400 to-blue-600' },
  { name: 'Advocate', threshold: 500, color: 'from-green-400 to-green-600' },
  { name: 'Champion', threshold: 1000, color: 'from-purple-400 to-purple-600' },
  { name: 'Legend', threshold: 5000, color: 'from-yellow-400 to-yellow-600' },
]

const BADGE_DEFINITIONS = [
  {
    id: 'first-vote',
    name: 'First Vote',
    description: 'Cast your first vote on a campaign',
    icon: 'star',
  },
  {
    id: 'first-comment',
    name: 'First Comment',
    description: 'Leave your first comment on a campaign',
    icon: 'message-circle',
  },
  {
    id: '7-day-streak',
    name: '7-Day Streak',
    description: 'Contribute to campaigns for 7 consecutive days',
    icon: 'flame',
  },
  {
    id: '30-day-streak',
    name: '30-Day Streak',
    description: 'Contribute to campaigns for 30 consecutive days',
    icon: 'fire',
  },
  {
    id: 'top-supporter',
    name: 'Top Supporter',
    description: 'Become a top supporter of a campaign',
    icon: 'trophy',
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Support a campaign in its first week',
    icon: 'zap',
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Refer 10+ supporters to campaigns',
    icon: 'trending-up',
  },
  {
    id: 'ambassador',
    name: 'Ambassador',
    description: 'Complete all achievement badges',
    icon: 'crown',
  },
]

// ============================================================================
// ICON MAPPING
// ============================================================================

function BadgeIcon({ icon }: { icon: string }) {
  const iconProps = { className: 'w-6 h-6' }

  switch (icon) {
    case 'star':
      return <Star {...iconProps} />
    case 'message-circle':
      return <Award {...iconProps} />
    case 'flame':
      return <Flame {...iconProps} />
    case 'fire':
      return <Flame {...iconProps} />
    case 'trophy':
      return <Trophy {...iconProps} />
    case 'zap':
      return <Zap {...iconProps} />
    case 'trending-up':
      return <TrendingUp {...iconProps} />
    case 'crown':
      return <Crown {...iconProps} />
    default:
      return <Award {...iconProps} />
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface XPProgressBarProps {
  currentXP: number
  currentLevelThreshold: number
  nextLevelThreshold: number
  currentLevel: string
}

function XPProgressBar({
  currentXP,
  currentLevelThreshold,
  nextLevelThreshold,
  currentLevel,
}: XPProgressBarProps) {
  const xpInCurrentLevel = currentXP - currentLevelThreshold
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold
  const progressPercent = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100)

  const levelData = LEVELS.find((l) => l.name === currentLevel)
  const gradientClass = levelData?.color || 'from-slate-400 to-slate-600'

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{currentLevel}</h3>
          <p className="text-sm text-slate-600">
            {xpInCurrentLevel} / {xpNeededForLevel} XP to next level
          </p>
        </div>
        <div className="text-2xl font-bold text-slate-900">{currentXP}</div>
      </div>

      <div className="relative w-full h-8 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out`}
          style={{ width: `${progressPercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {Math.round(progressPercent)}%
        </div>
      </div>

      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <div
            key={level.name}
            className={cn(
              'text-xs font-medium px-2 py-1 rounded transition-all',
              level.threshold <= currentXP
                ? `bg-gradient-to-r ${level.color} text-white`
                : 'bg-slate-300 text-slate-600'
            )}
          >
            {level.name}
          </div>
        ))}
      </div>
    </div>
  )
}

interface BadgeGridProps {
  earnedBadges: Badge[]
  lockedBadges: Badge[]
}

function BadgeGrid({ earnedBadges, lockedBadges }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-slate-900">Badges</h3>
        <span className="ml-auto text-sm font-medium text-slate-600">
          {earnedBadges.length} / {earnedBadges.length + lockedBadges.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {earnedBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedBadge(badge)}
            className="relative group"
          >
            <div className="aspect-square bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <BadgeIcon icon={badge.icon} />
            </div>
            <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <p className="text-xs text-center mt-1 font-medium text-slate-700">
              {badge.name}
            </p>
          </button>
        ))}

        {lockedBadges.map((badge) => (
          <div key={badge.id} className="relative group opacity-50">
            <div className="aspect-square bg-slate-300 rounded-lg p-3 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-xs text-center mt-1 font-medium text-slate-500">
              {badge.name}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {badge.description}
            </div>
          </div>
        ))}
      </div>

      {selectedBadge && (
        <div className="p-3 bg-white rounded border border-slate-300">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded flex items-center justify-center flex-shrink-0">
              <BadgeIcon icon={selectedBadge.icon} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{selectedBadge.name}</h4>
              <p className="text-sm text-slate-600">{selectedBadge.description}</p>
              {selectedBadge.earnedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface StreakCounterProps {
  currentStreak: number
  lastContributionDate: string | null
}

function StreakCounter({ currentStreak, lastContributionDate }: StreakCounterProps) {
  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-xs text-slate-500">
              {lastContributionDate
                ? `Last contribution: ${new Date(lastContributionDate).toLocaleDateString()}`
                : 'No contributions yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RecentXPGainsProps {
  gains: XPGain[]
}

function RecentXPGains({ gains }: RecentXPGainsProps) {
  const getEventLabel = (eventType: string): string => {
    const labels: Record<string, string> = {
      PREFERENCE_SUBMITTED: 'Preference Submitted',
      WISHLIST_SUBMITTED: 'Wishlist Submitted',
      REFERRAL_SIGNUP: 'Referral Signup',
      COMMENT_ENGAGEMENT: 'Comment Engagement',
      SOCIAL_SHARE: 'Social Share',
      BRAND_OUTREACH: 'Brand Outreach',
    }
    return labels[eventType] || eventType
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'REFERRAL_SIGNUP':
        return <TrendingUp className="w-4 h-4" />
      case 'SOCIAL_SHARE':
        return <Zap className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Recent XP Gains
      </h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {gains.length > 0 ? (
          gains.map((gain) => (
            <div
              key={gain.id}
              className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="text-blue-500">{getEventIcon(gain.eventType)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {getEventLabel(gain.eventType)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(gain.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">+{gain.points}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 py-4 text-center">No XP gained yet</p>
        )}
      </div>
    </div>
  )
}

interface LeaderboardPreviewProps {
  leaderboard: LeaderboardEntry[]
}

function LeaderboardPreview({ leaderboard }: LeaderboardPreviewProps) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-600" />
        Top Supporters
      </h3>

      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{medals[index] || '•'}</span>
              {entry.avatar && (
                <img
                  src={entry.avatar}
                  alt={entry.displayName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">{entry.displayName}</p>
                <p className="text-xs text-slate-500">{entry.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{entry.totalXP}</p>
              <p className="text-xs text-slate-500">XP</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          // Navigate to full leaderboard
          window.location.href = '/leaderboard'
        }}
      >
        View Full Leaderboard
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface GamificationEngineProps {
  campaignId: string
}

export function GamificationEngine({ campaignId }: GamificationEngineProps) {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGamificationData() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/gamification`)

        if (!response.ok) {
          throw new Error('Failed to fetch gamification data')
        }

        const data = await response.json()
        setGamificationData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setGamificationData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGamificationData()
  }, [campaignId])

  if (isLoading) {
    return (
      <div className="space-y-4 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <div className="h-8 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !gamificationData) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          {error || 'Failed to load gamification data'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* XP Progress Bar */}
      <XPProgressBar
        currentXP={gamificationData.totalXP}
        currentLevelThreshold={gamificationData.currentLevelThreshold}
        nextLevelThreshold={gamificationData.nextLevelThreshold}
        currentLevel={gamificationData.currentLevel}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <BadgeGrid
          earnedBadges={gamificationData.earnedBadges}
          lockedBadges={gamificationData.lockedBadges}
        />

        {/* Streak Counter */}
        <StreakCounter
          currentStreak={gamificationData.currentStreak}
          lastContributionDate={gamificationData.lastContributionDate}
        />
      </div>

      {/* Recent XP and Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentXPGains gains={gamificationData.recentXPGains} />
        <LeaderboardPreview leaderboard={gamificationData.leaderboard} />
      </div>
    </div>
  )
}
