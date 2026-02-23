/**
 * Campaign Stakeholder Registry API
 * GET /api/campaigns/[id]/stakeholders - Returns list of stakeholders for a campaign
 * POST /api/campaigns/[id]/stakeholders - Register as a stakeholder
 *
 * Stakeholders are stored as ContributionEvent with SOCIAL_SHARE + metadata action: 'stakeholder_register'
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type StakeholderRole = 'consumer' | 'retailer' | 'investor' | 'influencer' | 'media'

interface StakeholderData {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: StakeholderRole
  registeredAt: string
}

interface StakeholderGroup {
  role: StakeholderRole
  count: number
  stakeholders: StakeholderData[]
}

interface StakeholderResponse {
  success: boolean
  data?: {
    stakeholders: StakeholderGroup[]
    totalCount: number
  }
  error?: string
}

/**
 * GET /api/campaigns/[id]/stakeholders
 * Returns all stakeholders for a campaign, grouped by role
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StakeholderResponse>> {
  try {
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

    // Get all stakeholder registrations
    const stakeholderEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'stakeholder_register',
        },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by role
    const groupedStakeholders: Record<StakeholderRole, StakeholderData[]> = {
      consumer: [],
      retailer: [],
      investor: [],
      influencer: [],
      media: [],
    }

    for (const event of stakeholderEvents) {
      const metadata = event.metadata as Record<string, unknown>
      const role = (metadata.role as StakeholderRole) || 'consumer'

      groupedStakeholders[role].push({
        id: event.id,
        userId: event.userId,
        userName: event.user.displayName || 'Anonymous',
        userEmail: event.user.email || '',
        role,
        registeredAt: event.createdAt.toISOString(),
      })
    }

    const response: StakeholderGroup[] = []
    const roles: StakeholderRole[] = ['consumer', 'retailer', 'investor', 'influencer', 'media']

    for (const role of roles) {
      if (groupedStakeholders[role].length > 0) {
        response.push({
          role,
          count: groupedStakeholders[role].length,
          stakeholders: groupedStakeholders[role],
        })
      }
    }

    const totalCount = stakeholderEvents.length

    return NextResponse.json({
      success: true,
      data: {
        stakeholders: response,
        totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching stakeholders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stakeholders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/stakeholders
 * Register current user as a stakeholder for the campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<StakeholderResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const { role } = await request.json()

    // Validate role
    const validRoles: StakeholderRole[] = ['consumer', 'retailer', 'investor', 'influencer', 'media']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stakeholder role' },
        { status: 400 }
      )
    }

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

    // Check if user is already registered as this role
    const existingEvent = await prisma.contributionEvent.findFirst({
      where: {
        campaignId: campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'stakeholder_register',
        },
      },
    })

    if (existingEvent) {
      const existingMetadata = existingEvent.metadata as Record<string, unknown>
      if (existingMetadata.role === role) {
        return NextResponse.json(
          {
            success: false,
            error: 'You are already registered as a stakeholder with this role',
          },
          { status: 409 }
        )
      }
    }

    const metadata = {
      action: 'stakeholder_register',
      role,
      registeredAt: new Date().toISOString(),
    }

    const stakeholderEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 10,
        metadata,
      },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          stakeholders: [
            {
              role,
              count: 1,
              stakeholders: [
                {
                  id: stakeholderEvent.id,
                  userId: user.id,
                  userName: stakeholderEvent.user.displayName || 'Anonymous',
                  userEmail: stakeholderEvent.user.email || '',
                  role,
                  registeredAt: stakeholderEvent.createdAt.toISOString(),
                },
              ],
            },
          ],
          totalCount: 1,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering stakeholder:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register stakeholder' },
      { status: 500 }
    )
  }
}
