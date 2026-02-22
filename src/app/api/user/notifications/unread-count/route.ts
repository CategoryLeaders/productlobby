import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/notifications/unread-count
 * Returns the count of unread notifications for the current user
 * Returns 0 if user is not authenticated or if table doesn't exist
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { count: 0 }
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
    // Return 0 instead of error to gracefully handle table not existing
    return NextResponse.json(
      { count: 0 }
    )
  }
}
