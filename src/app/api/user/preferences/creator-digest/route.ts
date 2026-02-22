// GET/PUT /api/user/preferences/creator-digest
// Specialized endpoint for managing creator weekly digest preferences

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/preferences/creator-digest
 * Returns the current user's creator digest settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is a creator (has at least one campaign)
    const campaignCount = await prisma.campaign.count({
      where: { creatorUserId: user.id },
    })

    if (campaignCount === 0) {
      return NextResponse.json(
        { error: 'User is not a creator' },
        { status: 400 }
      )
    }

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          emailCampaignUpdates: true,
        },
      })
    }

    return NextResponse.json({
      emailCampaignUpdates: prefs.emailCampaignUpdates,
      lastDigestSentAt: prefs.lastDigestSentAt,
      emailDigestFrequency: prefs.emailDigestFrequency,
    })
  } catch (error) {
    console.error('[GET /api/user/preferences/creator-digest]', error)
    return NextResponse.json(
      { error: 'Failed to load creator digest preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/preferences/creator-digest
 * Update creator digest preferences
 *
 * Body: {
 *   emailCampaignUpdates?: boolean
 * }
 *
 * Response: {
 *   emailCampaignUpdates: boolean
 *   lastDigestSentAt: string | null
 *   emailDigestFrequency: string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is a creator
    const campaignCount = await prisma.campaign.count({
      where: { creatorUserId: user.id },
    })

    if (campaignCount === 0) {
      return NextResponse.json(
        { error: 'User is not a creator' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body
    if (typeof body.emailCampaignUpdates !== 'boolean') {
      return NextResponse.json(
        { error: 'emailCampaignUpdates must be a boolean' },
        { status: 400 }
      )
    }

    // Get or create notification preferences
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          emailCampaignUpdates: body.emailCampaignUpdates,
        },
      })
    } else {
      // Update the preference
      prefs = await prisma.notificationPreference.update({
        where: { userId: user.id },
        data: {
          emailCampaignUpdates: body.emailCampaignUpdates,
        },
      })
    }

    return NextResponse.json({
      emailCampaignUpdates: prefs.emailCampaignUpdates,
      lastDigestSentAt: prefs.lastDigestSentAt,
      emailDigestFrequency: prefs.emailDigestFrequency,
    })
  } catch (error) {
    console.error('[PUT /api/user/preferences/creator-digest]', error)
    return NextResponse.json(
      { error: 'Failed to update creator digest preferences' },
      { status: 500 }
    )
  }
}
