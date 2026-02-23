import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export interface AchievementBadge {
  id: string
  key: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt: string | null
}

interface AchievementsResponse {
  success: boolean
  data: AchievementBadge[]
  error?: string
}

// GET /api/users/achievements - Get user's earned achievement badges
export async function GET(request: NextRequest): Promise<NextResponse<AchievementsResponse>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, data: [], error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user data for achievements
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        createdAt: true,
        campaigns: {
          select: {
            id: true,
            _count: {
              select: { lobbies: true },
            },
          },
        },
        lobbies: {
          select: { id: true },
        },
        comments: {
          select: { id: true },
        },
      },
    })

    if (!userData) {
      return NextResponse.json(
        { success: false, data: [], error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate achievements
    const achievements: AchievementBadge[] = []
    const now = new Date()

    // 1. First Campaign - created at least 1 campaign
    const campaignsCount = userData.campaigns.length
    const hasFirstCampaign = campaignsCount >= 1
    const firstCampaignDate = hasFirstCampaign ? userData.campaigns[0]?.id : null

    achievements.push({
      id: 'achievement-first-campaign',
      key: 'FIRST_CAMPAIGN',
      name: 'First Campaign',
      description: 'Create your first campaign',
      icon: '🚀',
      earned: hasFirstCampaign,
      earnedAt: hasFirstCampaign ? userData.campaigns[0]?.id || null : null,
    })

    // 2. Active Lobbyist - lobbied 5+ campaigns
    const lobbiedCount = userData.lobbies.length
    const isActiveLobbyist = lobbiedCount >= 5

    achievements.push({
      id: 'achievement-active-lobbyist',
      key: 'ACTIVE_LOBBYIST',
      name: 'Active Lobbyist',
      description: 'Lobby on 5 or more campaigns',
      icon: '🗳️',
      earned: isActiveLobbyist,
      earnedAt: isActiveLobbyist ? now.toISOString() : null,
    })

    // 3. Community Voice - left 10+ comments
    const commentsCount = userData.comments.length
    const isCommunityVoice = commentsCount >= 10

    achievements.push({
      id: 'achievement-community-voice',
      key: 'COMMUNITY_VOICE',
      name: 'Community Voice',
      description: 'Leave 10 or more comments',
      icon: '💬',
      earned: isCommunityVoice,
      earnedAt: isCommunityVoice ? now.toISOString() : null,
    })

    // 4. Trendsetter - created a campaign with 50+ lobbies
    const trendsetterCampaign = userData.campaigns.find(
      (c) => c._count.lobbies >= 50
    )
    const isTrendsetter = !!trendsetterCampaign

    achievements.push({
      id: 'achievement-trendsetter',
      key: 'TRENDSETTER',
      name: 'Trendsetter',
      description: 'Create a campaign with 50+ lobbies',
      icon: '⭐',
      earned: isTrendsetter,
      earnedAt: isTrendsetter ? now.toISOString() : null,
    })

    // 5. Early Adopter - account older than 30 days
    const accountAgeMs = now.getTime() - userData.createdAt.getTime()
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24)
    const isEarlyAdopter = accountAgeDays >= 30

    achievements.push({
      id: 'achievement-early-adopter',
      key: 'EARLY_ADOPTER',
      name: 'Early Adopter',
      description: 'Be a member for 30+ days',
      icon: '🌱',
      earned: isEarlyAdopter,
      earnedAt: isEarlyAdopter
        ? new Date(userData.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })

    return NextResponse.json({
      success: true,
      data: achievements,
    })
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    return NextResponse.json(
      { success: false, data: [], error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
