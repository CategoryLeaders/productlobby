import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { UpdateCampaignSchema } from '@/types'
import { calculateSignalScore } from '@/lib/signal-score'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/campaigns/[id] - Get campaign details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            status: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
        brandResponses: {
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
            author: {
              select: {
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        polls: {
          where: { status: 'ACTIVE' },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
            options: {
              include: {
                _count: {
                  select: { votes: true },
                },
              },
            },
          },
        },
        offers: {
          where: {
            status: { in: ['ACTIVE', 'SUCCESSFUL'] },
          },
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            pledges: true,
            follows: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate fresh signal score
    const signalResult = await calculateSignalScore(campaign.id)

    // Get pledge stats
    const pledgeStats = await prisma.pledge.groupBy({
      by: ['pledgeType'],
      where: { campaignId: id },
      _count: true,
    })

    // Get intent price stats
    const intentPrices = await prisma.pledge.aggregate({
      where: {
        campaignId: id,
        pledgeType: 'INTENT',
      },
      _avg: { priceCeiling: true },
      _max: { priceCeiling: true },
      _sum: { priceCeiling: true },
    })

    const supportCount = pledgeStats.find((s) => s.pledgeType === 'SUPPORT')?._count || 0
    const intentCount = pledgeStats.find((s) => s.pledgeType === 'INTENT')?._count || 0

    // Check if current user has pledged/followed
    const user = await getCurrentUser()
    let userPledge = null
    let userFollowing = false

    if (user) {
      userPledge = await prisma.pledge.findFirst({
        where: {
          campaignId: id,
          userId: user.id,
        },
      })

      const follow = await prisma.follow.findUnique({
        where: {
          campaignId_userId: {
            campaignId: id,
            userId: user.id,
          },
        },
      })
      userFollowing = !!follow
    }

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        signalScore: signalResult.score,
        signalTier: signalResult.tier,
        stats: {
          supportCount,
          intentCount,
          estimatedDemand: signalResult.demandValue,
          avgPriceCeiling: intentPrices._avg.priceCeiling
            ? Number(intentPrices._avg.priceCeiling)
            : 0,
          maxPriceCeiling: intentPrices._max.priceCeiling
            ? Number(intentPrices._max.priceCeiling)
            : 0,
          totalDemandValue: intentPrices._sum.priceCeiling
            ? Number(intentPrices._sum.priceCeiling)
            : 0,
        },
        userPledge,
        userFollowing,
      },
    })
  } catch (error) {
    console.error('Get campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true, status: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = UpdateCampaignSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: result.data,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
