import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Milestone type definition
interface Milestone {
  id: string
  title: string
  description?: string
  isComplete: boolean
  completedAt?: string | null
}

// ============================================================================
// PATCH: Toggle milestone completion
// ============================================================================

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

    const campaignId = params.id
    const body = await request.json()
    const { milestoneId, isComplete } = body

    // Validate input
    if (!milestoneId || typeof isComplete !== 'boolean') {
      return NextResponse.json(
        { error: 'milestoneId and isComplete are required' },
        { status: 400 }
      )
    }

    // Get campaign and verify user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        milestones: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can update milestones' },
        { status: 403 }
      )
    }

    // Parse current milestones
    let milestones: Milestone[] = []
    if (campaign.milestones) {
      try {
        milestones = typeof campaign.milestones === 'string'
          ? JSON.parse(campaign.milestones)
          : campaign.milestones
      } catch (e) {
        milestones = []
      }
    }

    // Find and update the milestone
    const milestone = milestones.find((m: Milestone) => m.id === milestoneId)
    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      )
    }

    milestone.isComplete = isComplete
    milestone.completedAt = isComplete ? new Date().toISOString() : null

    // Update campaign with new milestones
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        milestones: milestones as any,
      },
      select: {
        id: true,
        milestones: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        milestones: updatedCampaign.milestones,
      },
    })
  } catch (error) {
    console.error('[PATCH /api/campaigns/[id]/milestones]', error)
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Fetch milestones for a campaign
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        milestones: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    let milestones: Milestone[] = []
    if (campaign.milestones) {
      try {
        milestones = typeof campaign.milestones === 'string'
          ? JSON.parse(campaign.milestones)
          : campaign.milestones
      } catch (e) {
        milestones = []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        milestones,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/milestones]', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}
