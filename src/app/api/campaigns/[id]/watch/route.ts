/**
 * Campaign Watch API
 * POST /api/campaigns/[id]/watch - Toggle watch status
 * GET /api/campaigns/[id]/watch - Check if watching
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// POST: Toggle watch status (add if not watching, remove if watching)
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

    // Check if user is already watching this campaign
    const existingWatch = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    // Check if there's an active watch record in metadata
    let isWatching = false
    if (existingWatch && existingWatch.metadata) {
      const meta = existingWatch.metadata as any
      isWatching = meta.action === 'watch' && meta.active === true
    }

    let watching = false

    if (isWatching) {
      // Remove watch by marking as inactive
      await prisma.contributionEvent.update({
        where: { id: existingWatch!.id },
        data: {
          metadata: {
            action: 'watch',
            active: false,
          },
        },
      })
      watching = false
    } else {
      // Add or update watch record
      if (existingWatch) {
        await prisma.contributionEvent.update({
          where: { id: existingWatch.id },
          data: {
            metadata: {
              action: 'watch',
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
              action: 'watch',
              active: true,
            },
          },
        })
      }
      watching = true
    }

    // Get current watch count
    const watchCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        watching,
        count: watchCount,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Toggle watch error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Check if current user is watching this campaign
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

    let watching = false

    if (user) {
      const watchEvent = await prisma.contributionEvent.findFirst({
        where: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
        },
      })

      if (watchEvent && watchEvent.metadata) {
        const meta = watchEvent.metadata as any
        watching = meta.action === 'watch' && meta.active === true
      }
    }

    // Get total watch count
    const watchCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        watching,
        count: watchCount,
      },
    })
  } catch (error) {
    console.error('Get watch status error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
