import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/users/watchlist
// ============================================================================
// Returns user's watched campaigns
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const sortBy = searchParams.get('sortBy') || 'recently_added'
    const search = searchParams.get('search') || ''

    // Get watched campaigns from contribution events
    const watchedEvents = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'watch_campaign',
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            description: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter by search if provided
    let campaigns = watchedEvents
      .filter((event) => {
        if (!search) return true
        const campaign = event.campaign
        return (
          campaign.title.toLowerCase().includes(search.toLowerCase()) ||
          campaign.category.toLowerCase().includes(search.toLowerCase())
        )
      })
      .map((event) => {
        const metadata = event.metadata as any
        return {
          id: event.campaign.id,
          title: event.campaign.title,
          slug: event.campaign.slug,
          category: event.campaign.category,
          description: event.campaign.description,
          status: event.campaign.status,
          supporterCount: 0, // Will be fetched separately if needed
          lastActivity: event.campaign.createdAt,
          watchedAt: event.createdAt,
          notificationPreference: metadata?.notificationPreference || 'all',
        }
      })

    // Sort based on sortBy parameter
    if (sortBy === 'most_active') {
      // Would need additional query to count recent activity
      // For now, we'll sort by most recently created campaigns
      campaigns.sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      )
    } else if (sortBy === 'alphabetical') {
      campaigns.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // recently_added (default)
      campaigns.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
    }

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        count: campaigns.length,
      },
    })
  } catch (error) {
    console.error('[GET /api/users/watchlist]', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/users/watchlist
// ============================================================================
// Add or remove campaign from watchlist
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campaignId, action = 'toggle', notificationPreference = 'all' } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 }
      )
    }

    if (!['add', 'remove', 'toggle'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be add, remove, or toggle' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, slug: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if campaign is already watched
    const existingWatch = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'watch_campaign',
        },
      },
      select: { id: true },
    })

    const isWatched = !!existingWatch

    // Determine the actual action to take
    let shouldAdd = false
    if (action === 'toggle') {
      shouldAdd = !isWatched
    } else if (action === 'add') {
      shouldAdd = true
      if (isWatched) {
        return NextResponse.json(
          {
            success: true,
            data: {
              watched: true,
              message: 'Campaign already in watchlist',
            },
          },
          { status: 200 }
        )
      }
    } else if (action === 'remove') {
      shouldAdd = false
      if (!isWatched) {
        return NextResponse.json(
          {
            success: true,
            data: {
              watched: false,
              message: 'Campaign not in watchlist',
            },
          },
          { status: 200 }
        )
      }
    }

    if (shouldAdd) {
      // Add to watchlist
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
          points: 10,
          metadata: {
            action: 'watch_campaign',
            notificationPreference,
            timestamp: new Date().toISOString(),
            campaignTitle: campaign.title,
          },
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            watched: true,
            message: 'Campaign added to watchlist',
          },
        },
        { status: 201 }
      )
    } else {
      // Remove from watchlist
      if (existingWatch) {
        await prisma.contributionEvent.delete({
          where: { id: existingWatch.id },
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          watched: false,
          message: 'Campaign removed from watchlist',
        },
      })
    }
  } catch (error) {
    console.error('[POST /api/users/watchlist]', error)
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/users/watchlist
// ============================================================================
// Update notification preferences for a watched campaign
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campaignId, notificationPreference } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 }
      )
    }

    if (!['all', 'milestones', 'none'].includes(notificationPreference)) {
      return NextResponse.json(
        { error: 'notificationPreference must be all, milestones, or none' },
        { status: 400 }
      )
    }

    // Find the watch event
    const watchEvent = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'watch_campaign',
        },
      },
      select: { id: true, metadata: true },
    })

    if (!watchEvent) {
      return NextResponse.json(
        { error: 'Campaign not in watchlist' },
        { status: 404 }
      )
    }

    // Update the notification preference
    const updatedMetadata = {
      ...(watchEvent.metadata as object),
      notificationPreference,
      updatedAt: new Date().toISOString(),
    }

    await prisma.contributionEvent.update({
      where: { id: watchEvent.id },
      data: {
        metadata: updatedMetadata,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        notificationPreference,
        message: 'Notification preference updated',
      },
    })
  } catch (error) {
    console.error('[PATCH /api/users/watchlist]', error)
    return NextResponse.json(
      { error: 'Failed to update notification preference' },
      { status: 500 }
    )
  }
}
