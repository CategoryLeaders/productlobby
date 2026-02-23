import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all sponsor entries for this campaign
    const sponsors = await prisma.sponsorSpotlight.findMany({
      where: { campaignId: params.id },
      orderBy: [
        { tier: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Error fetching sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sponsors' },
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true, creatorId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can add sponsors' },
        { status: 403 }
      )
    }

    const { name, logoUrl, tier, website } = await request.json()

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Sponsor name is required' },
        { status: 400 }
      )
    }

    if (!tier || !['gold', 'silver', 'bronze'].includes(tier.toLowerCase())) {
      return NextResponse.json(
        { error: 'Tier must be gold, silver, or bronze' },
        { status: 400 }
      )
    }

    // Create sponsor entry
    const sponsor = await prisma.sponsorSpotlight.create({
      data: {
        campaignId: params.id,
        name,
        logoUrl: logoUrl || null,
        tier: tier.toUpperCase() as 'GOLD' | 'SILVER' | 'BRONZE',
        website: website || null,
      },
    })

    // Create contribution event for the action
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: params.id,
        eventType: 'SOCIAL_SHARE',
        points: 25,
        metadata: {
          action: 'sponsor_spotlight',
          sponsorId: sponsor.id,
          tier: sponsor.tier,
        },
      },
    })

    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}
