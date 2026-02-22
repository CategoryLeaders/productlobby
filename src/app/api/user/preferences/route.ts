import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/user/preferences
 * Returns current user's notification preferences
 * Creates default preferences if they don't exist
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

    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if they don't exist
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          emailDigestFrequency: 'WEEKLY',
          emailCampaignUpdates: true,
          emailBrandResponses: true,
          emailNewFollowers: false,
          emailMilestones: true,
          pushEnabled: true,
        },
      })
    }

    return NextResponse.json(prefs)
  } catch (error) {
    console.error('[GET /api/user/preferences]', error)
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/preferences
 * Update notification preferences
 * Body: {
 *   emailDigestFrequency?: "DAILY" | "WEEKLY" | "NEVER"
 *   emailCampaignUpdates?: boolean
 *   emailBrandResponses?: boolean
 *   emailNewFollowers?: boolean
 *   emailMilestones?: boolean
 *   pushEnabled?: boolean
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

    const body = await request.json()

    // Validate emailDigestFrequency if provided
    if (
      body.emailDigestFrequency &&
      !['DAILY', 'WEEKLY', 'NEVER'].includes(body.emailDigestFrequency)
    ) {
      return NextResponse.json(
        { error: 'Invalid emailDigestFrequency value' },
        { status: 400 }
      )
    }

    // Get or create existing preferences
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Update only provided fields
    const updateData: Record<string, any> = {}
    if (body.emailDigestFrequency !== undefined) {
      updateData.emailDigestFrequency = body.emailDigestFrequency
    }
    if (body.emailCampaignUpdates !== undefined) {
      updateData.emailCampaignUpdates = body.emailCampaignUpdates
    }
    if (body.emailBrandResponses !== undefined) {
      updateData.emailBrandResponses = body.emailBrandResponses
    }
    if (body.emailNewFollowers !== undefined) {
      updateData.emailNewFollowers = body.emailNewFollowers
    }
    if (body.emailMilestones !== undefined) {
      updateData.emailMilestones = body.emailMilestones
    }
    if (body.pushEnabled !== undefined) {
      updateData.pushEnabled = body.pushEnabled
    }

    const updated = await prisma.notificationPreference.update({
      where: { userId: user.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/user/preferences]', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
