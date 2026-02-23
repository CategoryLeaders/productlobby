import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface EventLogItem {
  id: string
  type: 'lobby' | 'comment' | 'status_change' | 'brand_response'
  title: string
  description: string
  timestamp: string
  user?: {
    id: string
    displayName: string
    avatar?: string
  }
}

interface EventLogResponse {
  success: boolean
  data: EventLogItem[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

/**
 * GET /api/campaigns/[id]/event-log
 * Returns chronological event log for a campaign
 * Includes: lobbies created, comments, status changes, brand responses
 * Paginated with ?page=1&limit=20
 * Public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      },
      select: { id: true }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const realCampaignId = campaign.id

    // Fetch all event data concurrently
    const [lobbies, comments, brandResponses, statusUpdates] = await Promise.all([
      prisma.lobby.findMany({
        where: { campaignId: realCampaignId },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.comment.findMany({
        where: { campaignId: realCampaignId },
        select: {
          id: true,
          text: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.brandResponse.findMany({
        where: { campaignId: realCampaignId },
        select: {
          id: true,
          message: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      }),
      prisma.campaignUpdate.findMany({
        where: { campaignId: realCampaignId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      })
    ])

    // Combine all events into a single array
    const events: EventLogItem[] = []

    // Add lobby events
    lobbies.forEach(lobby => {
      events.push({
        id: `lobby-${lobby.id}`,
        type: 'lobby',
        title: 'New Support',
        description: `${lobby.user.displayName} added their support`,
        timestamp: lobby.createdAt.toISOString(),
        user: lobby.user
      })
    })

    // Add comment events
    comments.forEach(comment => {
      const preview = comment.text.length > 100
        ? comment.text.substring(0, 100) + '...'
        : comment.text
      events.push({
        id: `comment-${comment.id}`,
        type: 'comment',
        title: 'New Comment',
        description: preview,
        timestamp: comment.createdAt.toISOString(),
        user: comment.user
      })
    })

    // Add brand response events
    brandResponses.forEach(response => {
      const preview = response.message.length > 100
        ? response.message.substring(0, 100) + '...'
        : response.message
      events.push({
        id: `response-${response.id}`,
        type: 'brand_response',
        title: 'Brand Response',
        description: preview,
        timestamp: response.createdAt.toISOString(),
        user: response.user
      })
    })

    // Add campaign update events (status changes)
    statusUpdates.forEach(update => {
      events.push({
        id: `update-${update.id}`,
        type: 'status_change',
        title: 'Campaign Update',
        description: update.title,
        timestamp: update.createdAt.toISOString(),
        user: update.user
      })
    })

    // Sort by timestamp descending (newest first)
    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const total = events.length
    const paginatedEvents = events.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching event log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event log' },
      { status: 500 }
    )
  }
}
