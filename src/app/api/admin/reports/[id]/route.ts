import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  return user?.email === adminEmail
}

const ActionSchema = z.object({
  action: z.enum(['REMOVE', 'BAN', 'WARN', 'SHADOWBAN', 'RESTORE', 'DISMISS']),
  notes: z.string().max(1000).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/reports/[id] - Take action on a report
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const isUserAdmin = await isAdmin(user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = ActionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { action, notes } = result.data

    // Handle dismiss separately
    if (action === 'DISMISS') {
      await prisma.report.update({
        where: { id },
        data: {
          status: 'DISMISSED',
          resolvedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Report dismissed',
      })
    }

    // Take moderation action
    await prisma.$transaction(async (tx: any) => {
      // Log the action
      await tx.moderationAction.create({
        data: {
          adminUserId: user.id,
          action,
          targetType: report.targetType,
          targetId: report.targetId,
          notes,
        },
      })

      // Update report status
      await tx.report.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      })

      // Apply the action to the target
      switch (report.targetType) {
        case 'CAMPAIGN':
          if (action === 'REMOVE') {
            await tx.campaign.update({
              where: { id: report.targetId },
              data: { status: 'PAUSED' },
            })
          }
          break

        case 'USER':
          if (action === 'BAN') {
            // In production, implement proper user banning
            // For now, just mark all their campaigns as paused
            await tx.campaign.updateMany({
              where: { creatorUserId: report.targetId },
              data: { status: 'PAUSED' },
            })
          }
          break

        case 'BRAND_RESPONSE':
          if (action === 'REMOVE') {
            await tx.brandResponse.delete({
              where: { id: report.targetId },
            })
          }
          break

        // Add more cases as needed
      }
    })

    return NextResponse.json({
      success: true,
      message: `Action ${action} applied successfully`,
    })
  } catch (error) {
    console.error('Report action error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
