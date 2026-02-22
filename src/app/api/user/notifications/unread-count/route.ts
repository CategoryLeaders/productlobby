import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/notifications/unread-count
 * Returns the count of unread notifications for the current user
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

    // Count unread notifications
    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('[GET /api/user/notifications/unread-count]', error)
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
}
