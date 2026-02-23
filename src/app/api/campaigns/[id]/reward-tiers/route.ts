import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

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

    // Get reward tiers for the campaign, ordered by min lobbies required
    const rewardTiers = await prisma.rewardTier.findMany({
      where: { campaignId },
      orderBy: { minLobbiesRequired: 'asc' },
    })

    return NextResponse.json({
      rewardTiers,
      total: rewardTiers.length,
    })
  } catch (error) {
    console.error('Error getting reward tiers:', error)
    return NextResponse.json(
      { error: 'Failed to get reward tiers' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can add reward tiers' },
        { status: 403 }
      )
    }

    // Parse request body
    const { name, description, minLobbiesRequired, rewardDescription } = await request.json()

    if (!name || !description || minLobbiesRequired === undefined || !rewardDescription) {
      return NextResponse.json(
        { error: 'Name, description, minLobbiesRequired, and rewardDescription are required' },
        { status: 400 }
      )
    }

    if (typeof minLobbiesRequired !== 'number' || minLobbiesRequired < 0) {
      return NextResponse.json(
        { error: 'minLobbiesRequired must be a non-negative number' },
        { status: 400 }
      )
    }

    // Create reward tier
    const rewardTier = await prisma.rewardTier.create({
      data: {
        campaignId,
        name,
        description,
        minLobbiesRequired,
        rewardDescription,
      },
    })

    // Record as contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 15,
        metadata: {
          action: 'reward_tier',
          rewardTierId: rewardTier.id,
          tierName: name,
        },
      },
    })

    return NextResponse.json(
      {
        rewardTier,
        message: 'Reward tier created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating reward tier:', error)
    return NextResponse.json(
      { error: 'Failed to create reward tier' },
      { status: 500 }
    )
  }
}
