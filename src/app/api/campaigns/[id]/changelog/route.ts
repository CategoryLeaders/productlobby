import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// Map contribution event types to changelog entry change types
const getChangeTypeFromEventType = (eventType: string, metadata?: Record<string, any>): string => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'METADATA_UPDATED'
    case 'WISHLIST_SUBMITTED':
      return 'METADATA_UPDATED'
    case 'REFERRAL_SIGNUP':
      return 'METADATA_UPDATED'
    case 'COMMENT_ENGAGEMENT':
      return 'METADATA_UPDATED'
    case 'SOCIAL_SHARE':
      return 'METADATA_UPDATED'
    case 'BRAND_OUTREACH':
      return 'METADATA_UPDATED'
    default:
      return 'METADATA_UPDATED'
  }
}

// Get description for a changelog entry
const getChangeDescription = (eventType: string, metadata?: Record<string, any>): string => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'User submitted a preference'
    case 'WISHLIST_SUBMITTED':
      return 'Campaign added to wishlist'
    case 'REFERRAL_SIGNUP':
      return 'Referral signup recorded'
    case 'COMMENT_ENGAGEMENT':
      return metadata?.action === 'created' ? 'New comment posted' : 'Comment engagement recorded'
    case 'SOCIAL_SHARE':
      const platform = metadata?.platform || 'social media'
      return `Campaign shared on ${platform}`
    case 'BRAND_OUTREACH':
      return 'Brand outreach event recorded'
    default:
      return 'Campaign updated'
  }
}

// Map field names based on event type
const getFieldName = (eventType: string, metadata?: Record<string, any>): string => {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
      return 'Preferences'
    case 'WISHLIST_SUBMITTED':
      return 'Wishlist Status'
    case 'REFERRAL_SIGNUP':
      return 'Referral'
    case 'COMMENT_ENGAGEMENT':
      return 'Comments'
    case 'SOCIAL_SHARE':
      return `Share (${metadata?.platform || 'Unknown'})`
    case 'BRAND_OUTREACH':
      return 'Brand Outreach'
    default:
      return 'Campaign'
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const changeType = searchParams.get('changeType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify campaign exists and user has access
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { 
        id: true,
        creatorUserId: true,
        updatedAt: true,
        title: true,
        description: true,
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Build where clause for filters
    const where: any = {
      campaignId: campaignId,
    }

    // Apply date range filters
    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      // End of day
      const endOfDay = new Date(endDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.createdAt = {
        ...where.createdAt,
        lte: endOfDay
      }
    }

    // Get total count
    const total = await prisma.contributionEvent.count({ where })

    // Fetch changelog entries
    const events = await prisma.contributionEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: page * limit,
      take: limit + 1 // Fetch one extra to check if there are more
    })

    const hasMore = events.length > limit
    const entries = events.slice(0, limit)

    // Transform events into changelog format
    const changelogEntries = entries.map((event) => {
      const changeTypeValue = getChangeTypeFromEventType(event.eventType, event.metadata as Record<string, any> | undefined)
      const metadata = event.metadata as Record<string, any> | undefined

      return {
        id: event.id,
        timestamp: event.createdAt.toISOString(),
        userId: event.userId,
        userName: event.user.displayName,
        userAvatar: event.user.avatar,
        changeType: changeTypeValue,
        fieldName: getFieldName(event.eventType, metadata),
        beforeValue: metadata?.before || '(not recorded)',
        afterValue: metadata?.after || event.points || '(updated)',
        description: getChangeDescription(event.eventType, metadata),
      }
    })

    // Apply change type filter after transformation
    let filtered = changelogEntries
    if (changeType && changeType !== 'all') {
      filtered = changelogEntries.filter(
        (entry) => entry.changeType === changeType
      )
    }

    return NextResponse.json({
      entries: filtered,
      total: filtered.length,
      hasMore: hasMore && filtered.length === entries.length,
      page,
      limit,
    })
  } catch (error) {
    console.error('Changelog API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    )
  }
}
