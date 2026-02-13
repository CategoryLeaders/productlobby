import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { CreateReportSchema } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/campaigns/[id]/report - Report a campaign
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = CreateReportSchema.safeParse({
      ...body,
      targetType: 'CAMPAIGN',
      targetId: id,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if user already reported this
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterUserId: user.id,
        targetType: 'CAMPAIGN',
        targetId: id,
        status: { in: ['OPEN', 'INVESTIGATING'] },
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this campaign' },
        { status: 409 }
      )
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterUserId: user.id,
        targetType: 'CAMPAIGN',
        targetId: id,
        reason: result.data.reason,
        details: result.data.details,
      },
    })

    return NextResponse.json({
      success: true,
      data: report,
    }, { status: 201 })
  } catch (error) {
    console.error('Report campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
