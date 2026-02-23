/**
 * My Campaigns API
 * GET /api/campaigns/my-campaigns
 *
 * Returns campaigns the user owns or collaborates on
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/campaigns/my-campaigns
 * Get campaigns owned by the user or that they're collaborating on
 * Query params:
 *   - type: 'owned' | 'collaborating' | 'all'
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    // Get campaigns owned by the user
    const ownedCampaigns = await prisma.campaign.findMany({
      where: {
        creatorUserId: user.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Transform owned campaigns
    const ownedWithRole = ownedCampaigns.map((campaign) => ({
      ...campaign,
      role: 'owner' as const,
      lastActivityAt: campaign.updatedAt.toISOString(),
    }))

    // Get campaigns user is collaborating on using ContributionEvent as reference
    // Since we don't have a formal CampaignCollaborator model yet,
    // we track collaboration through ContributionEvent with SOCIAL_SHARE type
    const collaboratingEvents = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        campaignId: true,
        createdAt: true,
      },
      distinct: ['campaignId'],
    })

    const collaboratingCampaignIds = collaboratingEvents.map((e) => e.campaignId)

    let collaboratingCampaigns: any[] = []
    if (collaboratingCampaignIds.length > 0) {
      collaboratingCampaigns = await prisma.campaign.findMany({
        where: {
          id: { in: collaboratingCampaignIds },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      })
    }

    // Transform collaborating campaigns
    const collaboratingWithRole = collaboratingCampaigns.map((campaign) => ({
      ...campaign,
      role: 'collaborator' as const,
      lastActivityAt: campaign.updatedAt.toISOString(),
    }))

    // Return based on type filter
    let data = []
    if (type === 'owned') {
      data = ownedWithRole
    } else if (type === 'collaborating') {
      data = collaboratingWithRole
    } else {
      data = [...ownedWithRole, ...collaboratingWithRole]
    }

    // Convert dates to ISO strings for serialization
    const serializedData = data.map((campaign) => ({
      ...campaign,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: serializedData,
      count: serializedData.length,
    })
  } catch (error) {
    console.error('Error fetching my campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
