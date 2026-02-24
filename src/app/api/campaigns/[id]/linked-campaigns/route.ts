import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

interface LinkedCampaign {
  id: string
  title: string
  slug: string
  supporters: number
  status: 'active' | 'completed' | 'draft'
  relationship: 'related' | 'coalition' | 'sequel' | 'prerequisite'
  sharedSupporters: number
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    // Simulated linked campaigns data
    const linkedCampaigns: LinkedCampaign[] = [
      {
        id: 'camp-001',
        title: 'Save Local Theaters Initiative',
        slug: 'save-local-theaters',
        supporters: 2845,
        status: 'active',
        relationship: 'coalition',
        sharedSupporters: 542,
      },
      {
        id: 'camp-002',
        title: 'Arts Funding Movement',
        slug: 'arts-funding-movement',
        supporters: 5234,
        status: 'active',
        relationship: 'related',
        sharedSupporters: 189,
      },
      {
        id: 'camp-003',
        title: 'Cultural Heritage Series Part 1',
        slug: 'cultural-heritage-series-1',
        supporters: 1823,
        status: 'completed',
        relationship: 'sequel',
        sharedSupporters: 891,
      },
      {
        id: 'camp-004',
        title: 'Community Theater Foundations',
        slug: 'community-theater-foundations',
        supporters: 3456,
        status: 'active',
        relationship: 'prerequisite',
        sharedSupporters: 267,
      },
    ]

    // Simulated available campaigns to link
    const availableCampaigns: LinkedCampaign[] = [
      {
        id: 'camp-005',
        title: 'Film Industry Recovery Fund',
        slug: 'film-recovery-fund',
        supporters: 4127,
        status: 'active',
        relationship: 'related',
        sharedSupporters: 0,
      },
      {
        id: 'camp-006',
        title: 'Streaming Rights Reform',
        slug: 'streaming-rights-reform',
        supporters: 6543,
        status: 'active',
        relationship: 'related',
        sharedSupporters: 0,
      },
      {
        id: 'camp-007',
        title: 'Independent Artists Network',
        slug: 'independent-artists-network',
        supporters: 2910,
        status: 'active',
        relationship: 'coalition',
        sharedSupporters: 0,
      },
    ]

    return NextResponse.json(
      {
        success: true,
        linkedCampaigns,
        availableCampaigns,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching linked campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch linked campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { linkedCampaignId, relationship } = await request.json()

    if (!linkedCampaignId) {
      return NextResponse.json(
        { success: false, error: 'linkedCampaignId is required' },
        { status: 400 }
      )
    }

    // Verify both campaigns exist
    const [campaign, linkedCampaign] = await Promise.all([
      prisma.campaign.findUnique({ where: { id: campaignId } }),
      prisma.campaign.findUnique({ where: { id: linkedCampaignId } }),
    ])

    if (!campaign || !linkedCampaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Record campaign link as a contribution event
    const event = await prisma.contributionEvent.create({
      data: {
        campaignId,
        userId: user.id,
        action: 'campaign_link',
        metadata: {
          linkedCampaignId,
          relationship,
          campaignTitle: linkedCampaign.title,
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        event,
        linkedCampaign: {
          id: linkedCampaignId,
          title: linkedCampaign.title,
          slug: linkedCampaign.slug,
          supporters: 0,
          status: 'active' as const,
          relationship: relationship || 'related',
          sharedSupporters: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error linking campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to link campaign' },
      { status: 500 }
    )
  }
}
