import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Simulated influencer data
const SIMULATED_INFLUENCERS = [
  {
    id: 'inf-001',
    name: 'Sarah Chen',
    handle: 'sarahchen_tech',
    platform: 'twitter',
    followers: 125000,
    engagementRate: 4.2,
    status: 'identified' as const,
    niche: 'Technology & SaaS',
    matchScore: 92,
  },
  {
    id: 'inf-002',
    name: 'Alex Rivera',
    handle: 'alexrivera_creative',
    platform: 'instagram',
    followers: 450000,
    engagementRate: 3.8,
    status: 'contacted',
    niche: 'Design & UX',
    matchScore: 87,
  },
  {
    id: 'inf-003',
    name: 'Jordan Martinez',
    handle: 'jordanmartinez',
    platform: 'youtube',
    followers: 280000,
    engagementRate: 5.1,
    status: 'interested',
    niche: 'Product Reviews',
    matchScore: 85,
  },
  {
    id: 'inf-004',
    name: 'Emmy Park',
    handle: 'emmypark_life',
    platform: 'tiktok',
    followers: 890000,
    engagementRate: 6.3,
    status: 'confirmed',
    niche: 'Lifestyle & Trends',
    matchScore: 78,
  },
  {
    id: 'inf-005',
    name: 'Marcus Johnson',
    handle: 'marcusjohnson',
    platform: 'linkedin',
    followers: 95000,
    engagementRate: 2.9,
    status: 'declined',
    niche: 'Business & Leadership',
    matchScore: 65,
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign || campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json(SIMULATED_INFLUENCERS)
  } catch (error) {
    console.error('Error fetching influencers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch influencers' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign || campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const body = await request.json()

    // Create a ContributionEvent to track the influencer outreach
    const event = await prisma.contributionEvent.create({
      data: {
        campaignId,
        userId: user.id,
        action: 'influencer_outreach',
        metadata: {
          influencerName: body.name,
          handle: body.handle,
          platform: body.platform,
          followers: body.followers,
          engagementRate: body.engagementRate,
          niche: body.niche,
          matchScore: body.matchScore,
        },
      },
    })

    // Return the influencer object with generated ID
    const influencer = {
      id: event.id,
      name: body.name,
      handle: body.handle,
      platform: body.platform,
      followers: body.followers,
      engagementRate: body.engagementRate,
      status: 'identified' as const,
      niche: body.niche,
      matchScore: body.matchScore,
    }

    return NextResponse.json(influencer, { status: 201 })
  } catch (error) {
    console.error('Error adding influencer:', error)
    return NextResponse.json(
      { error: 'Failed to add influencer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign || campaign.userId !== user.id) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const body = await request.json()
    const { influencerId, status } = body

    // Find the influencer in simulated data and update status
    const influencer = SIMULATED_INFLUENCERS.find((i) => i.id === influencerId)
    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Update the influencer status in the simulated data
    influencer.status = status

    // Create a ContributionEvent to track the status update
    await prisma.contributionEvent.create({
      data: {
        campaignId,
        userId: user.id,
        action: 'influencer_outreach',
        metadata: {
          influencerId,
          statusUpdate: status,
          influencerName: influencer.name,
        },
      },
    })

    return NextResponse.json(influencer)
  } catch (error) {
    console.error('Error updating influencer status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
