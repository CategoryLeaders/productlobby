/**
 * Campaign Report API
 * POST /api/campaigns/[id]/report
 *
 * Report a campaign for inappropriate content or spam.
 * Creates a Report record and a ContributionEvent for tracking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Valid report reasons
const VALID_REASONS = ['spam', 'inappropriate', 'misleading', 'duplicate', 'other']

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

    const { id: campaignId } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { reason, details } = body

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report reason' },
        { status: 400 }
      )
    }

    // Check if user already reported this campaign
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterUserId: user.id,
        targetType: 'CAMPAIGN',
        targetId: campaignId,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this campaign' },
        { status: 409 }
      )
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterUserId: user.id,
        targetType: 'CAMPAIGN',
        targetId: campaignId,
        reason,
        details: details || null,
        status: 'OPEN',
      },
    })

    // Create a ContributionEvent for tracking purposes
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          eventSubType: 'campaign_report',
          reason,
          reportId: report.id,
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign reported successfully',
        data: report,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Report campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
