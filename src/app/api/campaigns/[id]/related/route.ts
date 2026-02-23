import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params

    // Get the current campaign's category
    const currentCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        category: true,
      },
    })

    if (!currentCampaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Find related campaigns with matching category (excluding current campaign)
    // Sort by lobby count descending and limit to 4
    const relatedCampaigns = await prisma.campaign.findMany({
      where: {
        id: {
          not: campaignId,
        },
        category: currentCampaign.category,
        status: 'LIVE', // Only show live campaigns
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        _count: {
          select: {
            lobbies: true,
          },
        },
      },
      orderBy: {
        lobbies: {
          _count: 'desc',
        },
      },
      take: 4,
    })

    // Transform the response to include lobby count
    const formattedCampaigns = relatedCampaigns.map((campaign) => ({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      category: campaign.category,
      lobbyCount: campaign._count.lobbies,
    }))

    return NextResponse.json({
      success: true,
      campaigns: formattedCampaigns,
    })
  } catch (error) {
    console.error('Error fetching related campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related campaigns' },
      { status: 500 }
    )
  }
}
