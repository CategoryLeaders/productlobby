import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface TestimonialPayload {
  content: string
}

// GET /api/campaigns/[id]/testimonials - List testimonials for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

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

    // Get testimonials from contribution events
    const testimonials = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'testimonial',
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform to testimonial format
    const formattedTestimonials = testimonials.map((event) => ({
      id: event.id,
      userId: event.user.id,
      userName: event.user.displayName,
      userHandle: event.user.handle,
      userAvatar: event.user.avatar,
      content: (event.metadata as any)?.content || '',
      createdAt: event.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedTestimonials,
    })
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/testimonials - Create testimonial (auth required)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params

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

    // Parse and validate request
    const body: TestimonialPayload = await request.json()

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Testimonial content is required' },
        { status: 400 }
      )
    }

    if (body.content.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Testimonial must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Create contribution event with testimonial metadata
    const event = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'testimonial',
          content: body.content.trim(),
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
          id: event.id,
          userId: event.user.id,
          userName: event.user.displayName,
          userHandle: event.user.handle,
          userAvatar: event.user.avatar,
          content: (event.metadata as any)?.content || '',
          createdAt: event.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
