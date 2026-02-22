import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/campaigns/trending - Get trending campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
      },
      orderBy: [
        { signalScore: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: limit * 2,
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
        _count: {
          select: {
            lobbies: true,
            follows: true,
          },
        },
      },
    })

    const campaignsWithStats = campaigns
      .map((campaign: any) => {
        const signalScore = campaign.signalScore || 0
        const lobbyCount = campaign._count?.lobbies || 0
        const trendScore = signalScore * 0.6 + lobbyCount * 0.4

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
          followCount: campaign._count?.follows || 0,
          trendScore: trendScore,
          image: campaign.media[0]?.url || null,
          trendPercentage: Math.min(100, Math.round(signalScore * 1.2)) || 0,
        }
      })
      .sort((a: any, b: any) => b.trendScore - a.trendScore)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: campaignsWithStats,
      total: campaignsWithStats.length,
      limit,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/trending]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending campaigns' },
      { status: 500 }
    )
  }
}
