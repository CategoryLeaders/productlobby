import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

export interface Activity {
  id: string
  type: 'supporter_joined' | 'donation' | 'share' | 'comment' | 'milestone' | 'brand_response'
  actor: string
  message: string
  timestamp: string
  metadata?: Record<string, any>
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)

    // Get pagination parameters
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

    // Simulated activity feed data - 12 recent activities of various types
    const activities: Activity[] = [
      {
        id: 'activity-1',
        type: 'supporter_joined',
        actor: 'Sarah Mitchell',
        message: 'joined as a supporter',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metadata: { supporterCount: 5042 },
      },
      {
        id: 'activity-2',
        type: 'share',
        actor: 'James Chen',
        message: 'shared the campaign on Twitter/X',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        metadata: { platform: 'twitter', reach: 2300 },
      },
      {
        id: 'activity-3',
        type: 'milestone',
        actor: 'Campaign Team',
        message: 'reached 5,000 supporters milestone',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { milestone: '5000 supporters', progress: '50%' },
      },
      {
        id: 'activity-4',
        type: 'donation',
        actor: 'Emma Rodriguez',
        message: 'made a £50 donation',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        metadata: { amount: 50, currency: 'GBP', total: 12450 },
      },
      {
        id: 'activity-5',
        type: 'comment',
        actor: 'David Kim',
        message: 'posted a comment on the campaign update',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: { updateId: 'update-123' },
      },
      {
        id: 'activity-6',
        type: 'share',
        actor: 'Lisa Anderson',
        message: 'shared the campaign on Instagram',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        metadata: { platform: 'instagram', reach: 1850 },
      },
      {
        id: 'activity-7',
        type: 'supporter_joined',
        actor: 'Marcus Johnson',
        message: 'joined as a supporter',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        metadata: { supporterCount: 5041 },
      },
      {
        id: 'activity-8',
        type: 'brand_response',
        actor: 'Brand Communications',
        message: 'responded to the campaign request',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        metadata: { responseType: 'official', status: 'acknowledged' },
      },
      {
        id: 'activity-9',
        type: 'comment',
        actor: 'Nina Patel',
        message: 'posted a comment on the campaign update',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        metadata: { updateId: 'update-122' },
      },
      {
        id: 'activity-10',
        type: 'donation',
        actor: 'Robert Thompson',
        message: 'made a £100 donation',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        metadata: { amount: 100, currency: 'GBP', total: 12350 },
      },
      {
        id: 'activity-11',
        type: 'share',
        actor: 'Olivia Brown',
        message: 'shared the campaign on TikTok',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        metadata: { platform: 'tiktok', reach: 5200 },
      },
      {
        id: 'activity-12',
        type: 'supporter_joined',
        actor: 'Alex Wong',
        message: 'joined as a supporter',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        metadata: { supporterCount: 5040 },
      },
    ]

    // Get total count for pagination
    const total = activities.length

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching campaign activity feed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign activity feed' },
      { status: 500 }
    )
  }
}
