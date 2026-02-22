import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface ActivityItem {
  id: string
  type: 'notification' | 'update' | 'response'
  title: string
  message: string
  linkUrl?: string | null
  read: boolean
  createdAt: Date
  campaign?: {
    title: string
    slug: string
  }
}

/**
 * GET /api/user/activity
 * Returns unified activity feed combining notifications, campaign updates, and brand responses
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 50)
 *   - type: 'all' | 'notifications' | 'updates' | 'responses' (default: 'all')
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const filterType = (searchParams.get('type') || 'all') as 'all' | 'notifications' | 'updates' | 'responses'

    const skip = (page - 1) * limit

    // Fetch activity items based on filter type
    let items: ActivityItem[] = []

    if (filterType === 'all' || filterType === 'notifications') {
      // Get user's notifications
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: filterType === 'all' ? undefined : skip,
      })

      items.push(
        ...notifications.map((n) => ({
          id: n.id,
          type: 'notification' as const,
          title: n.title,
          message: n.message,
          linkUrl: n.linkUrl,
          read: n.read,
          createdAt: n.createdAt,
        }))
      )
    }

    if (filterType === 'all' || filterType === 'updates') {
      // Get campaign updates for campaigns the user follows
      const updates = await prisma.campaignUpdate.findMany({
        where: {
          campaign: {
            follows: {
              some: {
                userId: user.id,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: filterType === 'all' ? undefined : skip,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      })

      items.push(
        ...updates.map((u) => ({
          id: u.id,
          type: 'update' as const,
          title: u.title,
          message: u.content,
          linkUrl: `/campaigns/${u.campaign.slug}`,
          read: true, // Updates are always marked as read
          createdAt: u.createdAt,
          campaign: {
            title: u.campaign.title,
            slug: u.campaign.slug,
          },
        }))
      )
    }

    if (filterType === 'all' || filterType === 'responses') {
      // Get brand responses for campaigns the user follows
      const responses = await prisma.brandResponse.findMany({
        where: {
          campaign: {
            follows: {
              some: {
                userId: user.id,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: filterType === 'all' ? undefined : skip,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
          brand: {
            select: {
              name: true,
            },
          },
        },
      })

      items.push(
        ...responses.map((r) => ({
          id: r.id,
          type: 'response' as const,
          title: `${r.brand.name} responded to "${r.campaign.title}"`,
          message: r.content,
          linkUrl: `/campaigns/${r.campaign.slug}`,
          read: true, // Responses are always marked as read
          createdAt: r.createdAt,
          campaign: {
            title: r.campaign.title,
            slug: r.campaign.slug,
          },
        }))
      )
    }

    // Sort all items by createdAt descending
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination for 'all' type
    let paginatedItems = items
    if (filterType === 'all') {
      paginatedItems = items.slice(skip, skip + limit)
    }

    // Calculate total count (for pagination info)
    let totalCount = items.length
    if (filterType === 'all') {
      // Get exact count for all items
      const [notifCount, updateCount, responseCount] = await Promise.all([
        prisma.notification.count({ where: { userId: user.id } }),
        prisma.campaignUpdate.count({
          where: {
            campaign: {
              follows: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        }),
        prisma.brandResponse.count({
          where: {
            campaign: {
              follows: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        }),
      ])
      totalCount = notifCount + updateCount + responseCount
    }

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/user/activity]', error)
    return NextResponse.json(
      { error: 'Failed to load activity feed' },
      { status: 500 }
    )
  }
}
