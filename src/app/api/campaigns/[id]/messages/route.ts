import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/messages
// ============================================================================
// Returns all sent messages for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Fetch contribution events with eventType 'SOCIAL_SHARE' and metadata.action = 'supporter_message'
    const messageEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'supporter_message',
        },
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform and group by message event (using metadata.messageId)
    const messagesMap = new Map<
      string,
      {
        id: string
        subject: string
        body: string
        recipientGroup: 'all' | 'top' | 'recent'
        recipientCount: number
        createdAt: Date
      }
    >()

    messageEvents.forEach((event) => {
      const metadata = event.metadata as Record<string, any> | null
      if (!metadata) return

      const messageId = metadata.messageId as string
      const subject = metadata.subject as string
      const body = metadata.body as string
      const recipientGroup = (metadata.recipientGroup as string) || 'all'

      if (messageId && subject) {
        if (!messagesMap.has(messageId)) {
          messagesMap.set(messageId, {
            id: messageId,
            subject,
            body: body || '',
            recipientGroup: recipientGroup as 'all' | 'top' | 'recent',
            recipientCount: 0,
            createdAt: event.createdAt,
          })
        }

        const message = messagesMap.get(messageId)!
        message.recipientCount += 1
      }
    })

    const messages = Array.from(messagesMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/messages
// ============================================================================
// Send a message to supporters
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const user = await getCurrentUser()

    // Check authentication
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate campaign exists and user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can send messages' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { subject, body: messageBody, recipientGroup } = body

    // Validate input
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      )
    }

    if (!messageBody || typeof messageBody !== 'string' || !messageBody.trim()) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      )
    }

    if (
      !recipientGroup ||
      !['all', 'top', 'recent'].includes(recipientGroup)
    ) {
      return NextResponse.json(
        { error: 'Invalid recipient group' },
        { status: 400 }
      )
    }

    // Get supporters based on recipient group
    let supporterIds: string[] = []

    if (recipientGroup === 'all') {
      // Get all supporters who have interacted with the campaign
      const supporters = await prisma.contributionEvent.findMany({
        where: { campaignId },
        select: { userId: true },
        distinct: ['userId'],
      })
      supporterIds = [...new Set(supporters.map((s) => s.userId))]
    } else if (recipientGroup === 'top') {
      // Get top supporters by contribution count
      const topSupporters = await prisma.contributionEvent.findMany({
        where: { campaignId },
        select: { userId: true },
      })

      // Count contributions per user and sort
      const userContributionMap = new Map<string, number>()
      topSupporters.forEach((event) => {
        userContributionMap.set(
          event.userId,
          (userContributionMap.get(event.userId) || 0) + 1
        )
      })

      // Get top 25% of supporters
      const topCount = Math.max(
        1,
        Math.ceil(userContributionMap.size * 0.25)
      )
      supporterIds = Array.from(userContributionMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topCount)
        .map(([userId]) => userId)
    } else if (recipientGroup === 'recent') {
      // Get recent supporters (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentSupporters = await prisma.contributionEvent.findMany({
        where: {
          campaignId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { userId: true },
        distinct: ['userId'],
      })
      supporterIds = recentSupporters.map((s) => s.userId)
    }

    // Create contribution events for each supporter (max 1000 to avoid timeout)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const batchSize = 100
    const supporterBatch = supporterIds.slice(0, 1000)

    for (let i = 0; i < supporterBatch.length; i += batchSize) {
      const batch = supporterBatch.slice(i, i + batchSize)

      await Promise.all(
        batch.map((supporterId) =>
          prisma.contributionEvent.create({
            data: {
              userId: supporterId,
              campaignId,
              eventType: 'SOCIAL_SHARE',
              points: 0,
              metadata: {
                action: 'supporter_message',
                messageId,
                subject: subject.trim(),
                body: messageBody.trim(),
                recipientGroup,
              },
            },
          })
        )
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        recipientCount: supporterBatch.length,
        messageId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
