import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requirePhoneVerification } from '@/lib/auth'
import { CreatePledgeSchema } from '@/types'
import { updateCachedSignalScore } from '@/lib/signal-score'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/campaigns/[id]/pledges - Add a pledge
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email verification required' },
        { status: 403 }
      )
    }

    const { id: campaignId } = await params

    // Check campaign exists and is live
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'LIVE') {
      return NextResponse.json(
        { success: false, error: 'Campaign is not accepting pledges' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = CreatePledgeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // High-signal intent pledges require phone verification
    if (
      data.pledgeType === 'INTENT' &&
      data.priceCeiling &&
      data.priceCeiling > 200
    ) {
      try {
        await requirePhoneVerification(user.id)
      } catch {
        return NextResponse.json(
          { success: false, error: 'Phone verification required for high-value intent pledges' },
          { status: 403 }
        )
      }
    }

    // Check if user already has this pledge type
    const existingPledge = await prisma.pledge.findUnique({
      where: {
        campaignId_userId_pledgeType: {
          campaignId,
          userId: user.id,
          pledgeType: data.pledgeType,
        },
      },
    })

    if (existingPledge) {
      return NextResponse.json(
        { success: false, error: 'You have already added this pledge type' },
        { status: 409 }
      )
    }

    // Create pledge
    const pledge = await prisma.pledge.create({
      data: {
        campaignId,
        userId: user.id,
        pledgeType: data.pledgeType,
        priceCeiling: data.priceCeiling,
        timeframeDays: data.timeframeDays,
        region: data.region,
        options: data.options,
        isPrivate: data.isPrivate,
      },
    })

    // Update signal score asynchronously
    updateCachedSignalScore(campaignId).catch(console.error)

    return NextResponse.json({
      success: true,
      data: pledge,
    }, { status: 201 })
  } catch (error) {
    console.error('Create pledge error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// GET /api/campaigns/[id]/pledges - List pledges for a campaign
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = await params

    const pledges = await prisma.pledge.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Hide private pledges' user info
    const publicPledges = pledges.map((pledge) => ({
      ...pledge,
      user: pledge.isPrivate
        ? { id: 'private', displayName: 'Private Supporter', handle: null }
        : pledge.user,
    }))

    return NextResponse.json({
      success: true,
      data: publicPledges,
    })
  } catch (error) {
    console.error('List pledges error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
