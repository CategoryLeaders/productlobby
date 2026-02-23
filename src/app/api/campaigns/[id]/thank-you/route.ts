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

    // Get thank you messages for the campaign, ordered by date descending
    const messages = await prisma.thankYouMessage.findMany({
      where: { campaignId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      messages,
      total: messages.length,
    })
  } catch (error) {
    console.error('Error getting thank you messages:', error)
    return NextResponse.json(
      { error: 'Failed to get thank you messages' },
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
      select: { id: true, creatorUserId: true, lobbyCount: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can post thank you messages' },
        { status: 403 }
      )
    }

    // Parse request body
    const { milestone, message } = await request.json()

    if (!milestone || !message) {
      return NextResponse.json(
        { error: 'Milestone and message are required' },
        { status: 400 }
      )
    }

    if (typeof milestone !== 'number' || milestone < 0) {
      return NextResponse.json(
        { error: 'Milestone must be a non-negative number' },
        { status: 400 }
      )
    }

    // Create thank you message
    const thankYouMessage = await prisma.thankYouMessage.create({
      data: {
        campaignId,
        creatorUserId: user.id,
        milestone,
        message,
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
    })

    // Record as contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 10,
        metadata: {
          action: 'thank_you_message',
          messageId: thankYouMessage.id,
          milestone,
        },
      },
    })

    return NextResponse.json(
      {
        message: thankYouMessage,
        response: 'Thank you message posted successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating thank you message:', error)
    return NextResponse.json(
      { error: 'Failed to create thank you message' },
      { status: 500 }
    )
  }
}
