/**
 * User Watchlist API
 * GET /api/user/watchlist - Get user's watched campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET: Get user's watchlist
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Get user's watch events (active ones only)
    const watchEvents = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        campaignId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // Filter for active watches and extract campaign IDs
    const activeCampaignIds = watchEvents
      .filter((event) => {
        const meta = event as any
        return meta.metadata?.action === 'watch' && meta.metadata?.active === true
      })
      .map((event) => event.campaignId)

    // Get campaign details
    const campaigns = await prisma.campaign.findMany({
      where: {
        id: {
          in: activeCampaignIds,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        image: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lobbies: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            lobbies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get total count for pagination
    const totalWatches = await prisma.contributionEvent.count({
      where: {
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
      },
    })

    // Format response
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description,
      category: campaign.category,
      image: campaign.image,
      status: campaign.status,
      lobbyCount: campaign._count.lobbies,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    }))

    const totalPages = Math.ceil(totalWatches / limit)

    return NextResponse.json({
      success: true,
      data: {
        campaigns: formattedCampaigns,
        pagination: {
          page,
          limit,
          total: totalWatches,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Get watchlist error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
