/**
 * Campaign Mood Board API
 * GET /api/campaigns/[id]/moodboard - Retrieve mood board items
 * POST /api/campaigns/[id]/moodboard - Add a new mood board item
 *
 * Mood board items are stored as ContributionEvents with SOCIAL_SHARE eventType
 * and metadata action: 'moodboard_item'
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/moodboard
// ============================================================================
// Returns all mood board items for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get mood board items (stored as ContributionEvents)
    const moodboardEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'moodboard_item',
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
      orderBy: { createdAt: 'desc' },
    })

    // Format the items for response
    const items = moodboardEvents.map((event) => {
      const metadata = event.metadata as any || {}
      return {
        id: event.id,
        type: metadata.type || 'note', // 'image', 'link', or 'note'
        content: metadata.content || '',
        description: metadata.description || '',
        imageUrl: metadata.imageUrl,
        linkUrl: metadata.linkUrl,
        createdBy: event.user,
        createdAt: event.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        items,
        count: items.length,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/moodboard]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mood board items' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/moodboard
// ============================================================================
// Add a new mood board item (requires authentication)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { type, content, description, imageUrl, linkUrl } = body

    // Validate required fields
    if (!type || !['image', 'link', 'note'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be one of: image, link, note' },
        { status: 400 }
      )
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user has access
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Only campaign creator can add mood board items
    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - only campaign creator can add items' },
        { status: 403 }
      )
    }

    // Create the mood board item as a ContributionEvent
    const metadata = {
      action: 'moodboard_item',
      type,
      content,
      description: description || '',
      ...(type === 'image' && imageUrl ? { imageUrl } : {}),
      ...(type === 'link' && linkUrl ? { linkUrl } : {}),
    }

    const event = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5, // Minimal points for mood board contribution
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
          id: event.id,
          type,
          content,
          description,
          imageUrl,
          linkUrl,
          createdBy: event.user,
          createdAt: event.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/moodboard]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add mood board item' },
      { status: 500 }
    )
  }
}
