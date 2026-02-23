import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RecentSupporter {
  id: string
  displayName: string
  avatar: string | null
}

interface SocialProofResponse {
  last24hCount: number
  recentSupporters: RecentSupporter[]
  totalSupporters: number
}

/**
 * GET /api/campaigns/[id]/social-proof
 * Returns recent supporter data for social proof widget
 * Last 24h lobby count, last 5 supporters with display names
 * Total supporter count
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

    const response: SocialProofResponse = {
      last24hCount,
      recentSupporters,
      totalSupporters: totalSupporters.length,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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
