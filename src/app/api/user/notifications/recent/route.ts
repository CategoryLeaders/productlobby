import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/notifications/recent
 * Returns the last 5 notifications for the current user
 * Includes unread count in the response
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

    // Fetch last 5 notifications
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('[GET /api/user/notifications/recent]', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent notifications' },
      { status: 500 }
    )
  }
}
