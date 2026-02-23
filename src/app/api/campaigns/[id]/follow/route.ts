/**
 * Campaign Follow API
 * POST /api/campaigns/[id]/follow - Toggle follow status
 * GET /api/campaigns/[id]/follow - Check if following
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// POST: Toggle follow status (add if not following, remove if following)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is already following this campaign
    const existingFollow = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    // Check if there's an active follow record in metadata
    let isFollowing = false
    if (existingFollow && existingFollow.metadata) {
      const meta = existingFollow.metadata as any
      isFollowing = meta.action === 'follow_campaign' && meta.active === true
    }

    let following = false

    if (isFollowing) {
      // Remove follow by marking as inactive
      await prisma.contributionEvent.update({
        where: { id: existingFollow!.id },
        data: {
          metadata: {
            action: 'follow_campaign',
            active: false,
          },
        },
      })
      following = false
    } else {
      // Add or update follow record
      if (existingFollow) {
        await prisma.contributionEvent.update({
          where: { id: existingFollow.id },
          data: {
            metadata: {
              action: 'follow_campaign',
              active: true,
            },
          },
        })
      } else {
        await prisma.contributionEvent.create({
          data: {
            userId: user.id,
            campaignId,
            eventType: 'SOCIAL_SHARE',
            points: 0,
            metadata: {
              action: 'follow_campaign',
              active: true,
            },
          },
        })
      }
      following = true
    }

    // Get current follow count
    const followCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'follow_campaign',
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        following,
        count: followCount,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Toggle follow error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Check if current user is following this campaign
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
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get current user (may be null for unauthenticated users)
    const user = await getCurrentUser()

    let following = false

    if (user) {
      const followEvent = await prisma.contributionEvent.findFirst({
        where: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
        },
      })

      if (followEvent && followEvent.metadata) {
        const meta = followEvent.metadata as any
        following = meta.action === 'follow_campaign' && meta.active === true
      }
    }

    // Get total follow count
    const followCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'follow_campaign',
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        following,
        count: followCount,
      },
    })
  } catch (error) {
    console.error('Get follow status error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
