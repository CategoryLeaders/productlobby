import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/webhooks - List all webhooks for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id: campaignId } = params

    // Find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all webhooks for this campaign
    const webhooks = await prisma.campaignWebhook.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        lastTriggered: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      webhooks,
    })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/webhooks - Add a new webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { url, events } = body

    if (!url || !events || events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URL and events are required' },
        { status: 400 }
      )
    }

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only campaign creators can add webhooks' },
        { status: 403 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create the webhook
    const webhook = await prisma.campaignWebhook.create({
      data: {
        campaignId: campaign.id,
        url,
        events,
        active: true,
      },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        lastTriggered: true,
        createdAt: true,
      },
    })

    // Log the contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          action: 'webhook_config',
          webhookId: webhook.id,
          events,
        },
      },
    })

    return NextResponse.json({
      success: true,
      webhook,
    })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}
