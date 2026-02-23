import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/compare - Compare multiple campaigns
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'Missing ids parameter' },
        { status: 400 }
      )
    }

    // Parse comma-separated IDs
    const ids = idsParam.split(',').filter(id => id.trim().length > 0)

    // Validate number of campaigns (min 2, max 4)
    if (ids.length < 2 || ids.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Must provide between 2 and 4 campaign IDs' },
        { status: 400 }
      )
    }

    // Fetch campaigns with full details
    const campaigns = await Promise.all(
      ids.map(id =>
        prisma.campaign.findFirst({
          where: {
            OR: [
              { id: id.trim() },
              { slug: id.trim() }
            ]
          },
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                handle: true,
                avatar: true,
                email: true,
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
            preferenceFields: {
              select: {
                id: true,
                fieldName: true,
              },
            },
            _count: {
              select: {
                lobbies: true,
                follows: true,
              },
            },
          },
        })
      )
    )

    // Check if all campaigns were found
    const foundCampaigns = campaigns.filter(c => c !== null)
    if (foundCampaigns.length !== ids.length) {
      return NextResponse.json(
        { success: false, error: 'One or more campaigns not found' },
        { status: 404 }
      )
    }

    // Fetch lobby stats for each campaign
    const campaignsWithStats = await Promise.all(
      foundCampaigns.map(async (campaign: any) => {
        const [
          totalLobbies,
          intensityDistribution,
        ] = await Promise.all([
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
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          slug: campaign.slug,
          category: campaign.category,
          status: campaign.status,
          createdAt: campaign.createdAt,
          signalScore: campaign.signalScore || 0,
          completenessScore: campaign.completenessScore || 0,
          creator: {
            id: campaign.creator.id,
            displayName: campaign.creator.displayName,
            handle: campaign.creator.handle,
            avatar: campaign.creator.avatar,
            email: campaign.creator.email,
          },
          targetedBrand: campaign.targetedBrand,
          media: campaign.media[0] || null,
          preferenceFields: campaign.preferenceFields,
          lobbyStats: {
            totalLobbies,
            intensityDistribution: intensityDistributionObject,
          },
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: campaignsWithStats,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/compare]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
