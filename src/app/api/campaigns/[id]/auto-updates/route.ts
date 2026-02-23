import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/auto-updates - Get auto-update schedule settings
export async function GET(
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

    const { id } = params

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        creatorUserId: true,
        autoUpdatesEnabled: true,
        autoUpdatesFrequency: true,
        autoUpdatesIncludeStats: true,
        autoUpdatesIncludeComments: true,
        autoUpdatesLastSentAt: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Only creator can view their auto-update settings
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate next scheduled update
    let nextScheduledUpdate = null
    if (campaign.autoUpdatesEnabled && campaign.autoUpdatesLastSentAt) {
      const lastSent = new Date(campaign.autoUpdatesLastSentAt)
      const frequency = campaign.autoUpdatesFrequency || 'weekly'

      let nextDate = new Date(lastSent)
      if (frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1)
      } else if (frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7)
      } else if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }

      nextScheduledUpdate = nextDate.toISOString()
    }

    return NextResponse.json({
      campaignId: campaign.id,
      enabled: campaign.autoUpdatesEnabled || false,
      frequency: campaign.autoUpdatesFrequency || 'weekly',
      includeStats: campaign.autoUpdatesIncludeStats !== false,
      includeComments: campaign.autoUpdatesIncludeComments !== false,
      lastSentAt: campaign.autoUpdatesLastSentAt,
      nextScheduledUpdate,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/auto-updates]', error)
    return NextResponse.json(
      { error: 'Failed to fetch auto-update settings' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/auto-updates - Configure auto-update preferences
export async function POST(
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

    const { id } = params
    const body = await request.json()
    const {
      enabled,
      frequency,
      includeStats,
      includeComments,
    } = body

    // Validate inputs
    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      )
    }

    if (frequency && !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'frequency must be one of: daily, weekly, monthly' },
        { status: 400 }
      )
    }

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update campaign with auto-update settings
    const updateData: any = {}

    if (enabled !== undefined) {
      updateData.autoUpdatesEnabled = enabled
    }

    if (frequency) {
      updateData.autoUpdatesFrequency = frequency
    }

    if (includeStats !== undefined) {
      updateData.autoUpdatesIncludeStats = includeStats
    }

    if (includeComments !== undefined) {
      updateData.autoUpdatesIncludeComments = includeComments
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        autoUpdatesEnabled: true,
        autoUpdatesFrequency: true,
        autoUpdatesIncludeStats: true,
        autoUpdatesIncludeComments: true,
      },
    })

    // Log contribution event for auto-update configuration
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'auto_update_config',
          enabled: enabled !== undefined ? enabled : undefined,
          frequency: frequency || undefined,
        },
      },
    })

    return NextResponse.json({
      campaignId: updatedCampaign.id,
      enabled: updatedCampaign.autoUpdatesEnabled || false,
      frequency: updatedCampaign.autoUpdatesFrequency || 'weekly',
      includeStats: updatedCampaign.autoUpdatesIncludeStats !== false,
      includeComments: updatedCampaign.autoUpdatesIncludeComments !== false,
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/auto-updates]', error)
    return NextResponse.json(
      { error: 'Failed to update auto-update settings' },
      { status: 500 }
    )
  }
}
