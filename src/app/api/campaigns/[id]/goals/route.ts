export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

interface GoalMetadata {
  action: 'campaign_goal'
  goalType: string
  targetValue: number
  deadline: string
  milestones?: number[]
}

/**
 * GET /api/campaigns/[id]/goals
 * Fetch all goals for a campaign from ContributionEvent records
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch goal events from ContributionEvent with metadata.action = 'campaign_goal'
    const goalEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter and transform goal events
    const goals = goalEvents
      .filter((event) => {
        const metadata = event.metadata as any
        return metadata && metadata.action === 'campaign_goal'
      })
      .map((event) => {
        const metadata = event.metadata as GoalMetadata
        const currentValue = calculateCurrentValue(event.campaignId, metadata)

        return {
          id: event.id,
          title: (metadata as any).title || 'Unnamed Goal',
          type: metadata.goalType || 'Custom',
          targetValue: metadata.targetValue || 0,
          currentValue: currentValue,
          deadline: metadata.deadline || new Date().toISOString(),
          milestones: metadata.milestones || [],
          status: calculateGoalStatus(currentValue, metadata.targetValue, metadata.deadline),
          createdAt: event.createdAt.toISOString(),
        }
      })

    return NextResponse.json({
      success: true,
      data: goals,
    })
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/goals
 * Create a new campaign goal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Verify campaign exists and user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the campaign creator can add goals' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, type, targetValue, deadline, milestones } = body

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Goal title is required' },
        { status: 400 }
      )
    }

    if (!type || !['Supporters', 'Votes', 'Shares', 'Comments', 'Custom'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid goal type' },
        { status: 400 }
      )
    }

    if (!targetValue || targetValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Target value must be greater than 0' },
        { status: 400 }
      )
    }

    if (!deadline) {
      return NextResponse.json(
        { success: false, error: 'Deadline is required' },
        { status: 400 }
      )
    }

    const deadlineDate = new Date(deadline)
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Deadline must be in the future' },
        { status: 400 }
      )
    }

    // Create goal as a ContributionEvent with SOCIAL_SHARE type
    const metadata: GoalMetadata = {
      action: 'campaign_goal',
      goalType: type,
      targetValue: targetValue,
      deadline: deadline,
      ...(milestones && { milestones }),
      title: title, // Store title in metadata
    }

    const goalEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: metadata,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: goalEvent.id,
          title: title,
          type: type,
          targetValue: targetValue,
          currentValue: 0,
          deadline: deadline,
          milestones: milestones || [],
          status: 'On Track',
          createdAt: goalEvent.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate current value based on goal type
 * This would integrate with actual campaign metrics
 */
function calculateCurrentValue(campaignId: string, metadata: GoalMetadata): number {
  // Placeholder: In production, this would:
  // - Count supporters for 'Supporters' type
  // - Count votes for 'Votes' type
  // - Count shares for 'Shares' type
  // - Count comments for 'Comments' type
  // For now, returning 0 as a placeholder
  return 0
}

/**
 * Helper function to calculate goal status based on progress and deadline
 */
function calculateGoalStatus(
  currentValue: number,
  targetValue: number,
  deadline: string
): 'On Track' | 'At Risk' | 'Behind' | 'Completed' {
  const progress = (currentValue / targetValue) * 100
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  const elapsedDays = Math.ceil(
    (now.getTime() - (deadlineDate.getTime() - 90 * 24 * 60 * 60 * 1000)) /
      (1000 * 60 * 60 * 24)
  )

  if (progress >= 100) return 'Completed'
  if (progress >= 75) return 'On Track'
  if (progress >= 50) return 'At Risk'
  return 'Behind'
}
