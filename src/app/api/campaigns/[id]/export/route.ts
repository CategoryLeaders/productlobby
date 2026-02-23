import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface CampaignReport {
  overview: {
    title: string
    description: string
    createdAt: string
    updatedAt: string
    status: string
  }
  keyMetrics: {
    lobbyCount: number
    commentCount: number
    eventTypeBreakdown: Record<string, number>
    totalEvents: number
  }
  timeline: {
    createdDate: string
    lastUpdateDate: string
    daysSinceCreation: number
  }
  topContributors: Array<{
    name: string
    handle: string
    contributionCount: number
  }>
}

// GET /api/campaigns/[id]/export - Export comprehensive campaign report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Get campaign with creator check
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
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
              select: {
                displayName: true,
                handle: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can export' },
        { status: 403 }
      )
    }

    // Aggregate data for report
    const [lobbyCount, commentCount, contributionEvents] = await Promise.all([
      prisma.lobby.count({
        where: { campaignId: id },
      }),
      prisma.comment.count({
        where: { campaignId: id },
      }),
      prisma.contributionEvent.findMany({
        where: { campaignId: id },
      }),
    ])

    // Count event types
    const eventTypeBreakdown: Record<string, number> = {}
    let totalEvents = 0

    contributionEvents.forEach((event) => {
      const eventType = event.eventType || 'UNKNOWN'
      eventTypeBreakdown[eventType] = (eventTypeBreakdown[eventType] || 0) + 1
      totalEvents++
    })

    // Get top contributors from comments
    const contributorMap = new Map<
      string,
      {
        name: string
        handle: string
        count: number
      }
    >()

    campaign.comments.forEach((comment) => {
      const key = `${comment.author.displayName}|${comment.author.handle || 'anonymous'}`
      const current = contributorMap.get(key)
      if (current) {
        current.count += 1
      } else {
        contributorMap.set(key, {
          name: comment.author.displayName,
          handle: comment.author.handle || 'anonymous',
          count: 1,
        })
      }
    })

    // Sort and get top 5
    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((contributor) => ({
        name: contributor.name,
        handle: contributor.handle,
        contributionCount: contributor.count,
      }))

    // Calculate timeline metrics
    const createdDate = new Date(campaign.createdAt)
    const updatedDate = new Date(campaign.updatedAt)
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Build comprehensive report
    const report: CampaignReport = {
      overview: {
        title: campaign.title,
        description: campaign.description,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
        status: campaign.status,
      },
      keyMetrics: {
        lobbyCount,
        commentCount,
        eventTypeBreakdown,
        totalEvents,
      },
      timeline: {
        createdDate: createdDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        lastUpdateDate: updatedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysSinceCreation,
      },
      topContributors,
    }

    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/export]', error)
    return NextResponse.json(
      { error: 'Failed to export campaign report' },
      { status: 500 }
    )
  }
}
