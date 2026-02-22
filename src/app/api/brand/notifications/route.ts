import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/brand/notifications
 * Returns brand-related notifications for the current user
 * Filters to show only notifications relevant to brand teams the user is part of
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - unread: Only show unread (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const unreadOnly = searchParams.get('unread') === 'true'

    // Check if user is part of any brand teams
    const brandTeams = await prisma.brandTeam.findMany({
      where: { userId: user.id },
      select: { brandId: true },
    })

    if (brandTeams.length === 0) {
      return NextResponse.json({
        notifications: [],
        total: 0,
        page,
        limit,
        pages: 0,
      })
    }

    // Brand notification types to filter
    const brandNotificationTypes = [
      'brand_new_campaign',
      'brand_milestone',
      'brand_response_requested',
      'brand_signal_threshold',
      'brand_response_posted',
      'brand_supporter_milestone',
    ]

    // Build where clause
    const whereClause = {
      userId: user.id,
      type: { in: brandNotificationTypes },
      ...(unreadOnly && { read: false }),
    }

    // Fetch total count
    const total = await prisma.notification.count({
      where: whereClause,
    })

    // Fetch paginated notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      notifications,
      total,
      page,
      limit,
      pages,
      unread: total - (await prisma.notification.count({
        where: {
          userId: user.id,
          type: { in: brandNotificationTypes },
          read: false,
        },
      })),
    })
  } catch (error) {
    console.error('[GET /api/brand/notifications]', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand notifications' },
      { status: 500 }
    )
  }
}
