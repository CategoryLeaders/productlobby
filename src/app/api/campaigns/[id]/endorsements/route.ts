import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface EndorsementParams {
  params: {
    id: string
  }
}

interface EndorsementMetadata {
  endorserName: string
  title: string
  organization: string
  reason?: string
}

// GET /api/campaigns/[id]/endorsements - List endorsements for a campaign
export async function GET(request: NextRequest, { params }: EndorsementParams) {
  try {
    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get endorsements from ContributionEvent table
    const endorsements = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['type'],
          equals: 'ENDORSEMENT',
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            handle: true,
          },
        },
      },
    })

    // Format endorsements
    const formattedEndorsements = endorsements.map((event) => {
      const metadata = event.metadata as EndorsementMetadata & { type?: string }

      return {
        id: event.id,
        userId: event.user.id,
        user: {
          id: event.user.id,
          displayName: event.user.displayName,
          avatar: event.user.avatar,
          handle: event.user.handle,
        },
        title: metadata.title || '',
        organization: metadata.organization || '',
        reason: metadata.reason || '',
        createdAt: event.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedEndorsements,
    })
  } catch (error) {
    console.error('Get endorsements error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/endorsements - Create an endorsement
export async function POST(request: NextRequest, { params }: EndorsementParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { title, organization, reason } = body

    // Validate input
    if (!title || !organization) {
      return NextResponse.json(
        { success: false, error: 'Title and organization are required' },
        { status: 400 }
      )
    }

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user has already endorsed this campaign
    const existingEndorsement = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['type'],
          equals: 'ENDORSEMENT',
        },
      },
    })

    if (existingEndorsement) {
      return NextResponse.json(
        { success: false, error: 'You have already endorsed this campaign' },
        { status: 409 }
      )
    }

    // Create endorsement as ContributionEvent
    const endorsement = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        points: 10, // Points for endorsement
        metadata: {
          type: 'ENDORSEMENT',
          endorserName: user.displayName,
          title,
          organization,
          reason: reason || '',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            handle: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: endorsement.id,
          userId: endorsement.user.id,
          user: {
            id: endorsement.user.id,
            displayName: endorsement.user.displayName,
            avatar: endorsement.user.avatar,
            handle: endorsement.user.handle,
          },
          title,
          organization,
          reason: reason || '',
          createdAt: endorsement.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create endorsement error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
