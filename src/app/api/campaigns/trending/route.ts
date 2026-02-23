import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/trending - Get trending campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const period = searchParams.get('period') || '24h'

    // Determine date range for recent activity
    let daysBack = 1
    switch (period) {
      case '7d':
        daysBack = 7
        break
      case '30d':
        daysBack = 30
        break
      case '24h':
      default:
        daysBack = 1
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
      },
      orderBy: [
        { signalScore: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit * 2,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        signalScore: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            handle: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        media: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            lobbies: true,
            follows: true,
            comments: true,
          },
        },
      },
    })

    // Get recent activity metrics for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign: any) => {
        // Count recent lobbies
        const recentLobbies = await prisma.lobby.count({
          where: {
            campaignId: campaign.id,
            createdAt: { gte: startDate },
          },
        })

        // Count recent comments
        const recentComments = await prisma.comment.count({
          where: {
            campaignId: campaign.id,
            createdAt: { gte: startDate },
          },
        })

        // Count recent shares
        const recentShares = await prisma.share.count({
          where: {
            campaignId: campaign.id,
            createdAt: { gte: startDate },
          },
        })

        // Count recent follows
        const recentFollows = await prisma.follow.count({
          where: {
            campaignId: campaign.id,
            createdAt: { gte: startDate },
          },
        })

        const signalScore = campaign.signalScore || 0
        const lobbyCount = campaign._count?.lobbies || 0
        const followCount = campaign._count?.follows || 0
        const commentCount = campaign._count?.comments || 0

        // Calculate trending score using recent activity and signal score
        // Weighted: recent lobbies (40%), recent comments (30%), recent follows (20%), recent shares (10%)
        const recentActivityScore =
          recentLobbies * 40 +
          recentComments * 30 +
          recentFollows * 20 +
          recentShares * 10

        // Blend recent activity with overall signal score for better results
        const trendingScore = recentActivityScore * 0.6 + signalScore * 0.4

        return {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          description: campaign.description,
          category: campaign.category,
          signalScore: signalScore,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
          creator: campaign.creator,
          targetedBrand: campaign.targetedBrand,
          media: campaign.media,
          lobbyCount: lobbyCount,
          followCount: followCount,
          commentCount: commentCount,
          image: campaign.media[0]?.url || null,
          trendScore: trendingScore,
          trendPercentage: Math.min(100, Math.round(signalScore * 1.2)) || 0,
          recentActivity: {
            lobbies: recentLobbies,
            comments: recentComments,
            shares: recentShares,
            follows: recentFollows,
          },
        }
      })
    )

    // Sort by trending score and return top campaigns
    const trendingCampaigns = campaignsWithStats
      .sort((a: any, b: any) => b.trendScore - a.trendScore)
      .slice(0, limit)
      .map((campaign: any, index: number) => ({
        ...campaign,
        rank: index + 1,
      }))

    return NextResponse.json({
      success: true,
      data: {
        period,
        campaigns: trendingCampaigns,
        total: trendingCampaigns.length,
        limit,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/trending]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending campaigns' },
      { status: 500 }
    )
  }
}
