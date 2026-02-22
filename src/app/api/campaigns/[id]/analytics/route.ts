import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    
    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check authorization - only creator can access analytics
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 1. Overview stats
    const lobbiesCount = await prisma.lobby.count({
      where: { campaignId: campaign.id }
    })

    const uniqueSupporters = await prisma.lobby.findMany({
      where: { campaignId: campaign.id },
      select: { userId: true },
      distinct: ['userId']
    })
    const uniqueSupportersCount = uniqueSupporters.length

    const updatesCount = await prisma.campaignUpdate.count({
      where: { campaignId: campaign.id }
    })

    const commentsCount = await prisma.comment.count({
      where: {
        update: {
          campaignId: campaign.id
        }
      }
    })

    const pollVotesCount = await prisma.creatorPollVote.count({
      where: {
        poll: {
          campaignId: campaign.id
        }
      }
    })

    // 2. Lobby timeline - last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const lobbyTimeline = await prisma.lobby.findMany({
      where: {
        campaignId: campaign.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by day
    const timelineMap = new Map<string, number>()
    for (const lobby of lobbyTimeline) {
      const dateKey = lobby.createdAt.toISOString().split('T')[0]
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + 1)
    }

    const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({
      date,
      count
    }))

    // 3. Intensity breakdown
    const intensityData = await prisma.lobby.groupBy({
      by: ['intensity'],
      where: { campaignId: campaign.id },
      _count: true
    })

    const intensityBreakdown = {
      NEAT_IDEA: 0,
      PROBABLY_BUY: 0,
      TAKE_MY_MONEY: 0
    }

    for (const item of intensityData) {
      intensityBreakdown[item.intensity as keyof typeof intensityBreakdown] = item._count
    }

    // 4. Recent activity - last 10 lobbies
    const recentLobbies = await prisma.lobby.findMany({
      where: { campaignId: campaign.id },
      select: {
        id: true,
        user: {
          select: {
            displayName: true
          }
        },
        intensity: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const recentActivity = recentLobbies.map(lobby => ({
      lobbyId: lobby.id,
      displayName: lobby.user.displayName,
      intensity: lobby.intensity,
      createdAt: lobby.createdAt
    }))

    // 5. Top supporters - highest intensity lobbies
    const topSupporters = await prisma.lobby.findMany({
      where: { campaignId: campaign.id },
      select: {
        user: {
          select: {
            displayName: true,
            handle: true,
            avatar: true
          }
        },
        intensity: true
      },
      orderBy: { intensity: 'desc' },
      take: 10
    })

    const uniqueTopSupporters = new Map<string, {
      displayName: string
      handle: string
      avatar: string | null
      intensity: string
    }>()

    for (const lobby of topSupporters) {
      const userId = lobby.user.handle
      if (!uniqueTopSupporters.has(userId)) {
        uniqueTopSupporters.set(userId, {
          displayName: lobby.user.displayName,
          handle: lobby.user.handle,
          avatar: lobby.user.avatar,
          intensity: lobby.intensity
        })
      }
    }

    const topSupportersArray = Array.from(uniqueTopSupporters.values())

    const response = {
      success: true,
      data: {
        overview: {
          totalLobbies: lobbiesCount,
          totalUniqueSupporters: uniqueSupportersCount,
          totalUpdates: updatesCount,
          totalComments: commentsCount,
          totalPollVotes: pollVotesCount,
          confidenceScore: campaign.completenessScore || 0
        },
        timeline,
        intensityBreakdown,
        recentActivity,
        topSupporters: topSupportersArray
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
