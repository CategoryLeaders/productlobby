import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'paused' | 'failed'
  lastTriggered?: string
  successRate: number
  failureCount: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Return simulated webhook data
    const webhooks: Webhook[] = [
      {
        id: 'wh_1',
        url: 'https://example.com/webhooks/campaigns',
        events: ['campaigns.updated', 'lobbies.submitted'],
        status: 'active',
        lastTriggered: '2 minutes ago',
        successRate: 99.8,
        failureCount: 2,
      },
      {
        id: 'wh_2',
        url: 'https://api.myservice.io/webhook',
        events: ['comments.posted', 'updates.published', 'milestones.reached'],
        status: 'active',
        lastTriggered: '15 minutes ago',
        successRate: 98.5,
        failureCount: 5,
      },
      {
        id: 'wh_3',
        url: 'https://notifications.company.com/receive',
        events: ['campaigns.created'],
        status: 'paused',
        successRate: 95.2,
        failureCount: 12,
      },
    ]

    return NextResponse.json(webhooks)
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
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

    const { id } = params
    const { url, events } = await request.json()

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user is campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create contribution event for webhook creation
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'WEBHOOK_CREATE',
        points: 10,
        metadata: { webhookUrl: url, events },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook created successfully',
    })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const { id } = params
    const { webhookId, status } = await request.json()

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user is campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create contribution event for webhook status change
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'WEBHOOK_UPDATE',
        points: 5,
        metadata: { webhookId, newStatus: status },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Webhook ${status}`,
    })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}
