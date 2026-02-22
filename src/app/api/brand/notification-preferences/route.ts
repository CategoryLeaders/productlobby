import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * Brand Notification Preferences
 * Allows brand team members to configure which notifications they receive
 */

interface BrandNotificationPreferences {
  newCampaigns: boolean
  milestones: boolean
  responseRequests: boolean
  signalScoreThresholds: boolean
  responsePostings: boolean
  supporterMilestones: boolean
}

/**
 * GET /api/brand/notification-preferences
 * Returns the current user's brand notification preferences
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

    // Check if user has brand notification preferences
    let preferences = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'brand_preferences',
      },
      select: {
        message: true, // Store preferences as JSON in message field
      },
    })

    // Default preferences if none exist
    const defaultPrefs: BrandNotificationPreferences = {
      newCampaigns: true,
      milestones: true,
      responseRequests: true,
      signalScoreThresholds: true,
      responsePostings: true,
      supporterMilestones: true,
    }

    if (preferences) {
      try {
        const parsed = JSON.parse(preferences.message)
        return NextResponse.json({ ...defaultPrefs, ...parsed })
      } catch {
        return NextResponse.json(defaultPrefs)
      }
    }

    return NextResponse.json(defaultPrefs)
  } catch (error) {
    console.error('[GET /api/brand/notification-preferences]', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/brand/notification-preferences
 * Updates the current user's brand notification preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validKeys = [
      'newCampaigns',
      'milestones',
      'responseRequests',
      'signalScoreThresholds',
      'responsePostings',
      'supporterMilestones',
    ]

    for (const key of Object.keys(body)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json(
          { error: `Invalid preference key: ${key}` },
          { status: 400 }
        )
      }
      if (typeof body[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Preference value must be boolean: ${key}` },
          { status: 400 }
        )
      }
    }

    // Get current preferences
    const currentPrefs = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'brand_preferences',
      },
    })

    const defaultPrefs: BrandNotificationPreferences = {
      newCampaigns: true,
      milestones: true,
      responseRequests: true,
      signalScoreThresholds: true,
      responsePostings: true,
      supporterMilestones: true,
    }

    const currentData = currentPrefs
      ? (() => {
          try {
            return JSON.parse(currentPrefs.message)
          } catch {
            return defaultPrefs
          }
        })()
      : defaultPrefs

    // Merge new preferences
    const updatedPrefs = { ...currentData, ...body }

    // Store or update preferences
    if (currentPrefs) {
      await prisma.notification.update({
        where: { id: currentPrefs.id },
        data: {
          message: JSON.stringify(updatedPrefs),
        },
      })
    } else {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'brand_preferences',
          title: 'Notification Preferences',
          message: JSON.stringify(updatedPrefs),
          read: true,
        },
      })
    }

    return NextResponse.json(updatedPrefs)
  } catch (error) {
    console.error('[PATCH /api/brand/notification-preferences]', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
