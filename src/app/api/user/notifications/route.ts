import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/notifications
 * Returns paginated notifications for the current user.
 * Supports ?page=1&limit=20&filter=all|unread
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: 1,
        pages: 0,
      })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const filter = searchParams.get('filter') || 'all'
    const skip = (page - 1) * limit

    const where = {
      userId: user.id,
      ...(filter === 'unread' ? { read: false } : {}),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ])

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/user/notifications]', error)
    return NextResponse.json({
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      pages: 0,
    })
  }
}
