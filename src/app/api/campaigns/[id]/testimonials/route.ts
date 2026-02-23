import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface TestimonialParams {
  params: {
    id: string
  }
}

interface TestimonialMetadata {
  action: string
  quote?: string
  author?: string
  title?: string
  rating?: number
}

// GET /api/campaigns/[id]/testimonials - List testimonials for a campaign
export async function GET(request: NextRequest, { params }: TestimonialParams) {
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

    // Get testimonials from ContributionEvent table where action is 'testimonial'
    const testimonials = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'testimonial',
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

    // Format testimonials
    const formattedTestimonials = testimonials.map((event) => {
      const metadata = event.metadata as TestimonialMetadata

      return {
        id: event.id,
        userId: event.user.id,
        quote: metadata.quote || '',
        author: metadata.author || event.user.displayName,
        title: metadata.title,
        rating: metadata.rating || 5,
        createdAt: event.createdAt,
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: formattedTestimonials,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get testimonials error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/testimonials - Create a new testimonial
export async function POST(request: NextRequest, { params }: TestimonialParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { quote, author, title, rating } = await request.json()

    // Validation
    if (!quote?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Testimonial text is required' },
        { status: 400 }
      )
    }

    if (!author?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Author name is required' },
        { status: 400 }
      )
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Support both UUID and slug-based lookup
    const { id } = params
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

    // Build metadata
    const metadata: TestimonialMetadata = {
      action: 'testimonial',
      quote: quote.trim(),
      author: author.trim(),
      rating: Math.max(1, Math.min(5, Math.round(rating))),
    }

    // Add title if provided
    if (title?.trim()) {
      metadata.title = title.trim()
    }

    // Create testimonial as ContributionEvent with eventType SOCIAL_SHARE and metadata.action = 'testimonial'
    const testimonial = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        points: 15, // Points for testimonial
        metadata,
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
          id: testimonial.id,
          userId: testimonial.user.id,
          quote: quote.trim(),
          author: author.trim(),
          title: title?.trim(),
          rating: Math.max(1, Math.min(5, Math.round(rating))),
          createdAt: testimonial.createdAt,
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
