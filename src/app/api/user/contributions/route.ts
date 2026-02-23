import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/user/contributions
// ============================================================================
// Returns all contribution events for the current user
// Supports filtering by type and pagination
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const eventType = searchParams.get('type') || '' // Filter by event type
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0'))
    const take = Math.min(parseInt(searchParams.get('take') || '20'), 100)
    const sortBy = searchParams.get('sortBy') || 'createdAt' // createdAt, points, campaign
    const sortOrder = searchParams.get('order') || 'desc' // asc or desc

    // Build where clause
    const where: any = { userId: user.id }
    if (eventType) {
      where.eventType = eventType
    }

    // Fetch contribution events with pagination
    const events = await prisma.contributionEvent.findMany({
      where,
      select: {
        id: true,
        eventType: true,
        points: true,
        metadata: true,
        createdAt: true,
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
            targetedBrand: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy:
        sortBy === 'points'
          ? { points: sortOrder as 'asc' | 'desc' }
          : { createdAt: sortOrder as 'asc' | 'desc' },
      skip,
      take,
    })

    // Get total count for pagination
    const totalCount = await prisma.contributionEvent.count({ where })

    // Group by type
    const grouped: Record<string, any[]> = {}
    events.forEach((event) => {
      if (!grouped[event.eventType]) {
        grouped[event.eventType] = []
      }
      grouped[event.eventType].push(event)
    })

    // Calculate summary stats
    const summaryStats = {
      totalContributions: totalCount,
      totalPoints: 0,
      campaignsSupported: 0,
      byType: {} as Record<string, number>,
    }

    // Get all contribution events for summary (no limit)
    const allEvents = await prisma.contributionEvent.findMany({
      where: { userId: user.id },
      select: {
        eventType: true,
        points: true,
        campaignId: true,
      },
    })

    const uniqueCampaigns = new Set<string>()
    allEvents.forEach((event) => {
      summaryStats.totalPoints += event.points
      summaryStats.byType[event.eventType] =
        (summaryStats.byType[event.eventType] || 0) + 1
      uniqueCampaigns.add(event.campaignId)
    })
    summaryStats.campaignsSupported = uniqueCampaigns.size

    // Get lobbies count
    const lobbiesCount = await prisma.lobby.count({
      where: { userId: user.id },
    })

    // Get pledges count
    const pledgesCount = await prisma.pledge.count({
      where: { userId: user.id },
    })

    // Get shares count
    const sharesCount = await prisma.share.count({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          displayName: user.displayName,
          avatar: user.avatar,
          handle: user.handle,
        },
        summary: {
          ...summaryStats,
          lobbies: lobbiesCount,
          pledges: pledgesCount,
          shares: sharesCount,
        },
        contributions: events,
        grouped,
        pagination: {
          skip,
          take,
          total: totalCount,
          pages: Math.ceil(totalCount / take),
          currentPage: Math.floor(skip / take) + 1,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/user/contributions]', error)
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    )
  }
}
