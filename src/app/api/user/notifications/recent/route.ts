import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/notifications/recent
 * Returns the last 5 notifications for the current user
 * Includes unread count in the response
 * Returns empty array if user is not authenticated or if table doesn't exist
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      })
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
    // Return empty array instead of error to gracefully handle table not existing
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    })
  }
}
