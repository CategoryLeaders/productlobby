import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// Map event types to human-readable descriptions
const getEventDescription = (eventType: string, metadata?: Record<string, any>): string => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'Submitted a preference'
    case 'WISHLIST_SUBMITTED':
      return 'Added to wishlist'
    case 'REFERRAL_SIGNUP':
      return 'Referred a new supporter'
    case 'COMMENT_ENGAGEMENT':
      return metadata?.action === 'created' 
        ? 'Posted a comment' 
        : 'Engaged with a comment'
    case 'SOCIAL_SHARE':
      const platform = metadata?.platform || 'social media'
      return `Shared on ${platform}`
    case 'BRAND_OUTREACH':
      return 'Contacted the brand'
    default:
      return 'Campaign activity'
  }
}

// Map event types to icon names for frontend
const getEventIconType = (eventType: string): string => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'LOBBY'
    case 'WISHLIST_SUBMITTED':
      return 'LOBBY'
    case 'REFERRAL_SIGNUP':
      return 'LOBBY'
    case 'COMMENT_ENGAGEMENT':
      return 'COMMENT'
    case 'SOCIAL_SHARE':
      return 'SOCIAL_SHARE'
    case 'BRAND_OUTREACH':
      return 'BRAND_OUTREACH'
    default:
      return 'ACTIVITY'
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Fetch contribution events with user info
    const events = await prisma.contributionEvent.findMany({
      where: { campaignId },
      select: {
        id: true,
        eventType: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination info
    const total = await prisma.contributionEvent.count({
      where: { campaignId },
    })

    // Transform events to include descriptions and icon types
    const transformedEvents = events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      description: getEventDescription(event.eventType, event.metadata as Record<string, any>),
      iconType: getEventIconType(event.eventType),
      user: event.user,
      createdAt: event.createdAt.toISOString(),
      metadata: event.metadata,
    }))

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching campaign activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign activity' },
      { status: 500 }
    )
  }
}
