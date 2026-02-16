import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/campaigns/trending - Get trending campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 50)

    const campaigns = await prisma.campaign.findMany({
      where: {
        signalScore: {
          not: null,
        },
      },
      orderBy: [
        { signalScore: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
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
      },
    })

    // Get verified lobby counts for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const [verifiedLobbyCount, intensityDistribution] = await Promise.all([
          prisma.lobby.count({
            where: {
              campaignId: campaign.id,
              status: 'VERIFIED',
            },
          }),
          prisma.lobby.groupBy({
            by: ['intensity'],
            where: {
              campaignId: campaign.id,
              status: 'VERIFIED',
            },
            _count: true,
          }),
        ])

        // Build intensity distribution object
        const intensityDistributionObject: Record<string, number> = {
          NEAT_IDEA: 0,
          PROBABLY_BUY: 0,
          TAKE_MY_MONEY: 0,
        }

        intensityDistribution.forEach((item: any) => {
          intensityDistributionObject[item.intensity] = item._count
        })

        return {
          ...campaign,
          verifiedLobbiesCount: verifiedLobbyCount,
          lobbyStats: {
            totalLobbies: verifiedLobbyCount,
            intensityDistribution: intensityDistributionObject,
          },
          firstMediaImage: campaign.media[0] || null,
        }
      })
    )

    return NextResponse.json({
      campaigns: campaignsWithStats,
      total: campaignsWithStats.length,
      limit,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/trending]', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending campaigns' },
      { status: 500 }
    )
  }
}
