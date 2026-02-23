/**
 * Campaign Waitlist API
 * GET /api/campaigns/[id]/waitlist - Get waitlist count and user's position
 * POST /api/campaigns/[id]/waitlist - Join the waitlist
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/waitlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const campaignId = params.id

    // Get total waitlist count for campaign
    const totalCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'waitlist_join',
        },
      },
    })

    let userPosition = null
    if (user) {
      // Check if user is on waitlist
      const userEntry = await prisma.contributionEvent.findFirst({
        where: {
          campaignId,
          userId: user.id,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            path: ['action'],
            equals: 'waitlist_join',
          },
        },
        select: { createdAt: true },
      })

      if (userEntry) {
        // Get user's position (count of entries created before this user)
        const earlierEntries = await prisma.contributionEvent.count({
          where: {
            campaignId,
            eventType: 'SOCIAL_SHARE',
            metadata: {
              path: ['action'],
              equals: 'waitlist_join',
            },
            createdAt: {
              lt: userEntry.createdAt,
            },
          },
        })
        userPosition = earlierEntries + 1
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCount,
        userPosition,
        isJoined: userPosition !== null,
      },
    })
  } catch (error) {
    console.error('Waitlist GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/waitlist
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

    // Check if user already on waitlist
    const existing = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'waitlist_join',
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already on waitlist' },
        { status: 400 }
      )
    }

    // Create waitlist entry
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'waitlist_join',
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Get user's position
    const userCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'waitlist_join',
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        joined: true,
        position: userCount,
        totalCount: userCount,
      },
    })
  } catch (error) {
    console.error('Waitlist POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
