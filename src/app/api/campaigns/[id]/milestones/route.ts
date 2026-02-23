/**
 * Campaign Milestones API
 * GET /api/campaigns/[id]/milestones - Get campaign milestones and progress
 * POST /api/campaigns/[id]/milestones - Record milestone share event
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// Milestone definitions for different milestone types
// ============================================================================

const SUPPORTER_MILESTONES = [10, 50, 100, 500, 1000]
const VOTE_MILESTONES = [10, 50, 100, 500, 1000]
const SHARE_MILESTONES = [5, 25, 50, 250, 500]
const DAYS_ACTIVE_MILESTONES = [7, 30, 90, 180, 365]

// ============================================================================
// GET: Retrieve campaign milestones and calculate progress
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        createdAt: true,
        pledges: {
          select: { id: true },
        },
        contributionEvents: {
          where: {
            eventType: 'SOCIAL_SHARE',
          },
          select: {
            metadata: true,
            createdAt: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate basic metrics
    const totalSupporters = campaign.pledges.length
    const totalShares = campaign.contributionEvents.filter(
      (event) =>
        event.metadata &&
        typeof event.metadata === 'object' &&
        'action' in event.metadata &&
        (event.metadata as any).action === 'share_campaign'
    ).length

    // Count votes (from contribution events with VOTE type in metadata)
    const totalVotes = campaign.contributionEvents.filter(
      (event) =>
        event.metadata &&
        typeof event.metadata === 'object' &&
        'action' in event.metadata &&
        (event.metadata as any).action === 'vote'
    ).length

    // Calculate days active
    const now = new Date()
    const daysActive = Math.floor(
      (now.getTime() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Build milestone data
    const milestones: any[] = []

    // Supporter milestones
    for (const threshold of SUPPORTER_MILESTONES) {
      const achieved = totalSupporters >= threshold
      const achievedEvent = campaign.contributionEvents.find(
        (event) =>
          event.metadata &&
          typeof event.metadata === 'object' &&
          (event.metadata as any).milestoneType === 'supporters' &&
          (event.metadata as any).milestoneThreshold === threshold
      )

      milestones.push({
        id: `supporters-${threshold}`,
        type: 'supporters',
        threshold,
        achieved,
        achievedAt: achieved ? achievedEvent?.createdAt : undefined,
        progress: totalSupporters,
        progressPercent: Math.min(
          100,
          Math.round((totalSupporters / threshold) * 100)
        ),
      })
    }

    // Vote milestones
    for (const threshold of VOTE_MILESTONES) {
      const achieved = totalVotes >= threshold
      const achievedEvent = campaign.contributionEvents.find(
        (event) =>
          event.metadata &&
          typeof event.metadata === 'object' &&
          (event.metadata as any).milestoneType === 'votes' &&
          (event.metadata as any).milestoneThreshold === threshold
      )

      milestones.push({
        id: `votes-${threshold}`,
        type: 'votes',
        threshold,
        achieved,
        achievedAt: achieved ? achievedEvent?.createdAt : undefined,
        progress: totalVotes,
        progressPercent: Math.min(100, Math.round((totalVotes / threshold) * 100)),
      })
    }

    // Share milestones
    for (const threshold of SHARE_MILESTONES) {
      const achieved = totalShares >= threshold
      const achievedEvent = campaign.contributionEvents.find(
        (event) =>
          event.metadata &&
          typeof event.metadata === 'object' &&
          (event.metadata as any).milestoneType === 'shares' &&
          (event.metadata as any).milestoneThreshold === threshold
      )

      milestones.push({
        id: `shares-${threshold}`,
        type: 'shares',
        threshold,
        achieved,
        achievedAt: achieved ? achievedEvent?.createdAt : undefined,
        progress: totalShares,
        progressPercent: Math.min(
          100,
          Math.round((totalShares / threshold) * 100)
        ),
      })
    }

    // Days active milestones
    for (const threshold of DAYS_ACTIVE_MILESTONES) {
      const achieved = daysActive >= threshold
      const achievedEvent = campaign.contributionEvents.find(
        (event) =>
          event.metadata &&
          typeof event.metadata === 'object' &&
          (event.metadata as any).milestoneType === 'days_active' &&
          (event.metadata as any).milestoneThreshold === threshold
      )

      milestones.push({
        id: `days_active-${threshold}`,
        type: 'days_active',
        threshold,
        achieved,
        achievedAt: achieved ? achievedEvent?.createdAt : undefined,
        progress: daysActive,
        progressPercent: Math.min(100, Math.round((daysActive / threshold) * 100)),
      })
    }

    // Sort milestones by achievement status and threshold
    milestones.sort((a, b) => {
      if (a.achieved !== b.achieved) {
        return b.achieved ? 1 : -1
      }
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type)
      }
      return a.threshold - b.threshold
    })

    const totalMilestonesAchieved = milestones.filter((m) => m.achieved).length

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        totalSupporters,
        totalVotes,
        totalShares,
        daysActive,
        totalMilestonesAchieved,
        milestones,
      },
    })
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: Record milestone share event
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const campaignId = params.id
    const body = await request.json()

    const {
      action,
      milestoneId,
      milestoneType,
      milestoneThreshold,
      shareText,
      shareUrl,
    } = body

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (action === 'share_milestone') {
      // Record the share milestone event
      const event = await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
          points: 5, // Award points for sharing milestone
          metadata: {
            action: 'share_milestone',
            milestoneId,
            milestoneType,
            milestoneThreshold,
            shareText,
            shareUrl,
            sharedAt: new Date().toISOString(),
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          eventId: event.id,
          message: 'Milestone share recorded successfully',
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error recording milestone share:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record milestone share' },
      { status: 500 }
    )
  }
}
