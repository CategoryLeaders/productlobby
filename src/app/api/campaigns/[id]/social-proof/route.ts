import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Notification {
  id: string
  type: 'support' | 'vote' | 'activity'
  message: string
  displayName: string
  timestamp: Date
  avatar?: string | null
}

interface RecentSupporter {
  id: string
  displayName: string
  avatar: string | null
}

interface SocialProofResponse {
  last24hCount: number
  recentSupporters: RecentSupporter[]
  totalSupporters: number
  recentActivities: Notification[]
  viewersNow: number
}

/**
 * GET /api/campaigns/[id]/social-proof
 * Returns real-time social proof data for widget display
 * - Recent supporter data and avatars
 * - Last 24h activity count
 * - Recent contribution events (activities)
 * - Estimated current viewers count
 * Public endpoint (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: campaignId } = await params

    // Validate campaign ID
    if (!campaignId || typeof campaignId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Get count of lobbies in last 24 hours
    const last24hCount = await prisma.lobby.count({
      where: {
        campaignId,
        status: 'VERIFIED',
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    })

    // Get last 5 recent supporters (distinct users who have lobbied)
    const recentLobbies = await prisma.lobby.findMany({
      where: {
        campaignId,
        status: 'VERIFIED',
      },
      select: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      distinct: ['userId'],
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    const recentSupporters: RecentSupporter[] = recentLobbies.map(
      (lobby) => ({
        id: lobby.user.id,
        displayName: lobby.user.displayName,
        avatar: lobby.user.avatar,
      })
    )

    // Get total supporter count (distinct users who have lobbied)
    const totalSupporters = await prisma.lobby.findMany({
      where: {
        campaignId,
        status: 'VERIFIED',
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    // Get recent contribution events (last 10 activities)
    const contributionEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        id: true,
        eventType: true,
        user: {
          select: {
            displayName: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Map contribution events to notification format
    const ActivityMessages: Record<string, (name: string) => string> = {
      PREFERENCE_SUBMITTED: (name: string) => `${name} submitted their preferences`,
      WISHLIST_SUBMITTED: (name: string) => `${name} added items to wishlist`,
      REFERRAL_SIGNUP: (name: string) => `${name} referred someone`,
      COMMENT_ENGAGEMENT: (name: string) => `${name} joined the discussion`,
      SOCIAL_SHARE: (name: string) => `${name} shared this campaign`,
      BRAND_OUTREACH: (name: string) => `${name} contacted the brand`,
    }

    const recentActivities: Notification[] = contributionEvents.map(
      (event) => ({
        id: event.id,
        type: 'activity' as const,
        message:
          ActivityMessages[event.eventType]?.(event.user.displayName) ||
          `${event.user.displayName} took action`,
        displayName: event.user.displayName,
        avatar: event.user.avatar,
        timestamp: event.createdAt,
      })
    )

    // Estimate current viewers (based on recent sessions in last hour)
    // This is a simple estimate using recent lobbies and pledges as proxies
    const recentSessions = await prisma.lobby.count({
      where: {
        campaignId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })

    // Add estimated ongoing viewers (rough estimate: 2-5x recent activity)
    const viewersNow = Math.max(3, Math.ceil(recentSessions * 1.5))

    const response: SocialProofResponse = {
      last24hCount,
      recentSupporters,
      totalSupporters: totalSupporters.length,
      recentActivities,
      viewersNow,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('Error fetching campaign social proof:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
