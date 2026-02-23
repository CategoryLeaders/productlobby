import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Category = 'Quality' | 'Value' | 'Experience' | 'Communication'

interface FeedbackData {
  rating: number
  category: Category
  comment: string
}

/**
 * GET /api/campaigns/[id]/feedback-survey
 * Returns survey questions and responses for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch all feedback survey responses for this campaign
    const feedbackEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        // Check metadata for feedback_survey action
      },
      select: {
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter and parse feedback events
    const responses = feedbackEvents
      .filter(event => {
        const metadata = event.metadata as Record<string, any> | null
        return metadata?.action === 'feedback_survey'
      })
      .map(event => {
        const metadata = event.metadata as Record<string, any>
        return {
          rating: metadata.rating || 0,
          category: metadata.category || 'Quality',
          comment: metadata.comment || '',
          createdAt: event.createdAt.toISOString(),
        }
      })

    // Calculate average rating
    const averageRating =
      responses.length > 0
        ? responses.reduce((sum, r) => sum + r.rating, 0) / responses.length
        : 0

    return NextResponse.json({
      averageRating,
      responseCount: responses.length,
      responses,
    })
  } catch (error) {
    console.error('Error fetching feedback survey:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback survey' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/feedback-survey
 * Submit feedback for a campaign
 * Requires: Authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body: FeedbackData = await request.json()

    // Validate input
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      )
    }

    const validCategories: Category[] = ['Quality', 'Value', 'Experience', 'Communication']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Create contribution event for feedback survey
    const event = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        points: 5, // Small point reward for feedback
        metadata: {
          action: 'feedback_survey',
          rating: body.rating,
          category: body.category,
          comment: body.comment || '',
        },
      },
    })

    return NextResponse.json({
      success: true,
      eventId: event.id,
    })
  } catch (error) {
    console.error('Error submitting feedback survey:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
