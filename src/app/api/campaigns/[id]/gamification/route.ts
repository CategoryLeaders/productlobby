export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// ============================================================================
// TYPES
// ============================================================================

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

interface GamificationResponse {
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

// ============================================================================
// CONSTANTS
// ============================================================================

const LEVELS = [
  { name: 'Newcomer', threshold: 0 },
  { name: 'Contributor', threshold: 100 },
  { name: 'Advocate', threshold: 500 },
  { name: 'Champion', threshold: 1000 },
  { name: 'Legend', threshold: 5000 },
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
// HELPERS
// ============================================================================

function getCurrentLevel(totalXP: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].threshold) {
      return LEVELS[i].name
    }
  }
  return LEVELS[0].name
}

function getLevelThresholds(totalXP: number): {
  current: number
  next: number
} {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].threshold) {
      const currentThreshold = LEVELS[i].threshold
      const nextThreshold = i < LEVELS.length - 1 ? LEVELS[i + 1].threshold : LEVELS[i].threshold
      return {
        current: currentThreshold,
        next: nextThreshold,
      }
    }
  }
  return {
    current: LEVELS[0].threshold,
    next: LEVELS[1].threshold,
  }
}

function calculateStreak(
  events: Array<{ createdAt: Date }>,
  lastEventDate: Date | null
): number {
  if (events.length === 0 || !lastEventDate) {
    return 0
  }

  // Check if last event was within the last 2 days
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  if (lastEventDate < twoDaysAgo) {
    return 0
  }

  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = sortedEvents.length - 1; i > 0; i--) {
    const currentDate = new Date(sortedEvents[i].createdAt)
    currentDate.setHours(0, 0, 0, 0)

    const previousDate = new Date(sortedEvents[i - 1].createdAt)
    previousDate.setHours(0, 0, 0, 0)

    const dayDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)

    if (dayDiff === 1) {
      streak++
    } else if (dayDiff > 1) {
      break
    }
  }

  return streak
}

function determineBadges(
  totalXP: number,
  currentStreak: number,
  campaignCount: number,
  hasCommented: boolean,
  referralCount: number,
  earlySupportCount: number
): {
  earned: Badge[]
  locked: Badge[]
} {
  const earned: Badge[] = []
  const locked: Badge[] = []

  // First Vote - if has any contribution events
  if (campaignCount > 0) {
    earned.push({
      id: 'first-vote',
      name: 'First Vote',
      description: 'Cast your first vote on a campaign',
      icon: 'star',
    })
  } else {
    locked.push({
      id: 'first-vote',
      name: 'First Vote',
      description: 'Cast your first vote on a campaign',
      icon: 'star',
    })
  }

  // First Comment
  if (hasCommented) {
    earned.push({
      id: 'first-comment',
      name: 'First Comment',
      description: 'Leave your first comment on a campaign',
      icon: 'message-circle',
    })
  } else {
    locked.push({
      id: 'first-comment',
      name: 'First Comment',
      description: 'Leave your first comment on a campaign',
      icon: 'message-circle',
    })
  }

  // 7-Day Streak
  if (currentStreak >= 7) {
    earned.push({
      id: '7-day-streak',
      name: '7-Day Streak',
      description: 'Contribute to campaigns for 7 consecutive days',
      icon: 'flame',
    })
  } else {
    locked.push({
      id: '7-day-streak',
      name: '7-Day Streak',
      description: 'Contribute to campaigns for 7 consecutive days',
      icon: 'flame',
    })
  }

  // 30-Day Streak
  if (currentStreak >= 30) {
    earned.push({
      id: '30-day-streak',
      name: '30-Day Streak',
      description: 'Contribute to campaigns for 30 consecutive days',
      icon: 'fire',
    })
  } else {
    locked.push({
      id: '30-day-streak',
      name: '30-Day Streak',
      description: 'Contribute to campaigns for 30 consecutive days',
      icon: 'fire',
    })
  }

  // Top Supporter - if 100+ XP (Top Supporter territory)
  if (totalXP >= 1000) {
    earned.push({
      id: 'top-supporter',
      name: 'Top Supporter',
      description: 'Become a top supporter of a campaign',
      icon: 'trophy',
    })
  } else {
    locked.push({
      id: 'top-supporter',
      name: 'Top Supporter',
      description: 'Become a top supporter of a campaign',
      icon: 'trophy',
    })
  }

  // Early Adopter - supported campaign in first week
  if (earlySupportCount > 0) {
    earned.push({
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'Support a campaign in its first week',
      icon: 'zap',
    })
  } else {
    locked.push({
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'Support a campaign in its first week',
      icon: 'zap',
    })
  }

  // Influencer - 10+ referrals
  if (referralCount >= 10) {
    earned.push({
      id: 'influencer',
      name: 'Influencer',
      description: 'Refer 10+ supporters to campaigns',
      icon: 'trending-up',
    })
  } else {
    locked.push({
      id: 'influencer',
      name: 'Influencer',
      description: 'Refer 10+ supporters to campaigns',
      icon: 'trending-up',
    })
  }

  // Ambassador - all badges earned
  if (earned.length === BADGE_DEFINITIONS.length) {
    earned.push({
      id: 'ambassador',
      name: 'Ambassador',
      description: 'Complete all achievement badges',
      icon: 'crown',
    })
  } else {
    locked.push({
      id: 'ambassador',
      name: 'Ambassador',
      description: 'Complete all achievement badges',
      icon: 'crown',
    })
  }

  return { earned, locked }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get campaign ID from params
    const { id: campaignId } = await params

    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all contribution events for the user in this campaign
    const contributionEvents = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        campaignId: campaignId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate total XP from contribution events
    const totalXP = contributionEvents.reduce((sum, event) => sum + event.points, 0)

    // Get current level and thresholds
    const currentLevel = getCurrentLevel(totalXP)
    const { current: currentLevelThreshold, next: nextLevelThreshold } =
      getLevelThresholds(totalXP)

    // Calculate XP progress
    const xpInCurrentLevel = Math.max(0, totalXP - currentLevelThreshold)
    const xpNeededForLevel = Math.max(1, nextLevelThreshold - currentLevelThreshold)
    const xpProgress = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100)

    // Calculate current streak
    const lastContribution = contributionEvents[0]
    const currentStreak = calculateStreak(contributionEvents, lastContribution?.createdAt ?? null)

    // Check for comment activity
    const hasCommented = await prisma.comment.findFirst({
      where: {
        userId: user.id,
      },
    })

    // Count campaigns user has contributed to
    const campaignContributions = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
      },
      select: {
        campaignId: true,
      },
      distinct: ['campaignId'],
    })
    const campaignCount = campaignContributions.length

    // Count referrals
    const referralLinks = await prisma.referralLink.findMany({
      where: {
        userId: user.id,
      },
    })
    const referralCount = referralLinks.reduce((sum, link) => sum + link.signupCount, 0)

    // Count early support
    const campaignEarly = await prisma.campaign.findMany({
      where: {
        contributionEvents: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
      take: 100,
    })

    const earlySupportCount = campaignEarly.filter((campaign) => {
      const weekAfterCreation = new Date(campaign.createdAt)
      weekAfterCreation.setDate(weekAfterCreation.getDate() + 7)
      return new Date() <= weekAfterCreation
    }).length

    // Determine badges
    const { earned: earnedBadges, locked: lockedBadges } = determineBadges(
      totalXP,
      currentStreak,
      campaignCount,
      !!hasCommented,
      referralCount,
      earlySupportCount
    )

    // Get recent XP gains (last 10)
    const recentXPGains = contributionEvents.slice(0, 10).map((event) => ({
      id: event.id,
      eventType: event.eventType.toString(),
      points: event.points,
      createdAt: event.createdAt.toISOString(),
    }))

    // Get leaderboard (top 3 contributors in this campaign)
    const leaderboardData = await prisma.contributionEvent.groupBy({
      by: ['userId'],
      where: {
        campaignId: campaignId,
      },
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 3,
    })

    const leaderboard: LeaderboardEntry[] = []
    for (const entry of leaderboardData) {
      const leaderUser = await prisma.user.findUnique({
        where: { id: entry.userId },
        select: {
          id: true,
          displayName: true,
          avatar: true,
        },
      })

      if (leaderUser) {
        const userTotalXP = entry._sum.points || 0
        leaderboard.push({
          userId: leaderUser.id,
          displayName: leaderUser.displayName,
          avatar: leaderUser.avatar || undefined,
          totalXP: userTotalXP,
          level: getCurrentLevel(userTotalXP),
        })
      }
    }

    const response: GamificationResponse = {
      userId: user.id,
      totalXP,
      currentLevel,
      currentLevelThreshold,
      nextLevelThreshold,
      xpProgress,
      currentStreak,
      lastContributionDate: lastContribution?.createdAt.toISOString() || null,
      earnedBadges,
      lockedBadges,
      recentXPGains,
      leaderboard,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching gamification data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
