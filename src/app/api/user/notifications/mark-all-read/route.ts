import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/user/notifications/mark-all-read
 * Marks all unread notifications as read for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        success: true,
        updated: 0,
      })
    }

    // Update all unread notifications for the user
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    console.error('[POST /api/user/notifications/mark-all-read]', error)
    // Return success even if there's an error to avoid breaking the UI
    return NextResponse.json({
      success: true,
      updated: 0,
    })
  }
}
