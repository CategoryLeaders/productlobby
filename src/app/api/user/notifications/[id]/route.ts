import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * PATCH /api/user/notifications/[id]
 * Mark a specific notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { read } = body

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the notification
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: typeof read === 'boolean' ? read : true,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('[PATCH /api/user/notifications/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
