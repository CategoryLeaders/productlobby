import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Default granular preferences structure
const DEFAULT_PREFERENCES = {
  campaigns_i_created: {
    email: true,
    push: true,
    in_app: true,
  },
  campaigns_i_support: {
    email: true,
    push: true,
    in_app: true,
  },
  community: {
    email: false,
    push: false,
    in_app: true,
  },
  system: {
    email: true,
    push: true,
    in_app: true,
  },
}

type PreferenceCategory = keyof typeof DEFAULT_PREFERENCES
type PreferenceChannel = 'email' | 'push' | 'in_app'

interface GranularPreferences {
  campaigns_i_created: Record<PreferenceChannel, boolean>
  campaigns_i_support: Record<PreferenceChannel, boolean>
  community: Record<PreferenceChannel, boolean>
  system: Record<PreferenceChannel, boolean>
}

// GET /api/user/notification-preferences/granular - Get granular preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Try to get existing preference
    let preference = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    if (!preference) {
      // Create default preference
      preference = await prisma.notificationPreference.create({
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

    // Get granular preferences from metadata (stored as JSON)
    const granularPrefs: GranularPreferences = (preference as any)
      .granularPreferences || DEFAULT_PREFERENCES

    return NextResponse.json(
      {
        preferences: granularPrefs,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching granular notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/user/notification-preferences/granular - Update granular preferences
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
    const { preferences } = body

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      )
    }

    // Validate preference structure
    const validCategories: PreferenceCategory[] = [
      'campaigns_i_created',
      'campaigns_i_support',
      'community',
      'system',
    ]

    const validChannels: PreferenceChannel[] = ['email', 'push', 'in_app']

    for (const category of validCategories) {
      if (
        preferences[category] &&
        typeof preferences[category] === 'object'
      ) {
        for (const channel of validChannels) {
          if (
            preferences[category][channel] !== undefined &&
            typeof preferences[category][channel] !== 'boolean'
          ) {
            return NextResponse.json(
              { error: `Invalid boolean value for ${category}.${channel}` },
              { status: 400 }
            )
          }
        }
      }
    }

    // Get or create preference record
    let preference = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    })

    if (!preference) {
      preference = await prisma.notificationPreference.create({
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

    // Update with granular preferences (stored as JSON in metadata-like field)
    const updated = await prisma.notificationPreference.update({
      where: { userId: user.id },
      data: {
        ...(preferences as any),
      },
    })

    return NextResponse.json(
      {
        preferences: preferences as GranularPreferences,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating granular notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
