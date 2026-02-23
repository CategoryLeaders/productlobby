import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/tags
// ============================================================================
// Returns all tags for a campaign with counts and contributor info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all tags for this campaign from ContributionEvent
    const tagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'tag_update',
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

    // Group tags and count usage
    const tagMap = new Map<string, {
      name: string
      addedBy: { id: string; displayName: string; avatar: string | null; handle: string | null }
      addedAt: string
      count: number
    }>()

    for (const event of tagEvents) {
      if (event.metadata && typeof event.metadata === 'object') {
        const metadata = event.metadata as any
        const tagName = metadata.tagName as string
        const operation = metadata.operation as string

        if (tagName && operation === 'add') {
          // Count total usage of this tag across all campaigns
          const tagSpecificCount = await prisma.contributionEvent.count({
            where: {
              eventType: 'SOCIAL_SHARE',
              metadata: {
                path: ['action'],
                equals: 'tag_update',
              },
              AND: [
                {
                  metadata: {
                    path: ['tagName'],
                    equals: tagName,
                  },
                },
                {
                  metadata: {
                    path: ['operation'],
                    equals: 'add',
                  },
                },
              ],
            },
          })

          if (tagSpecificCount > 0 && !tagMap.has(tagName)) {
            tagMap.set(tagName, {
              name: tagName,
              addedBy: {
                id: event.user.id,
                displayName: event.user.displayName,
                avatar: event.user.avatar,
                handle: event.user.handle,
              },
              addedAt: event.createdAt.toISOString(),
              count: tagSpecificCount,
            })
          }
        }
      }
    }

    const tags = Array.from(tagMap.values())

    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/tags]', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/tags
// ============================================================================
// Add a new tag to a campaign (creator-only, max 10 tags, no duplicates)
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

    const campaignId = params.id
    const { tagName } = await request.json()

    // Validate input
    if (!tagName || typeof tagName !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    const trimmedTag = tagName.trim().toLowerCase()

    if (trimmedTag.length < 1 || trimmedTag.length > 30) {
      return NextResponse.json(
        { error: 'Tag must be between 1 and 30 characters' },
        { status: 400 }
      )
    }

    // Verify campaign exists and get creator info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can add tags' },
        { status: 403 }
      )
    }

    // Check if tag already exists for this campaign
    const existingTag = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        userId: user.id,
        metadata: {
          path: ['tagName'],
          equals: trimmedTag,
        },
        AND: [
          {
            metadata: {
              path: ['action'],
              equals: 'tag_update',
            },
          },
          {
            metadata: {
              path: ['operation'],
              equals: 'add',
            },
          },
        ],
      },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already added to this campaign' },
        { status: 400 }
      )
    }

    // Check max tags per campaign (10 tags total)
    const tagCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'tag_update',
        },
        AND: [
          {
            metadata: {
              path: ['operation'],
              equals: 'add',
            },
          },
        ],
      },
    })

    if (tagCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 tags per campaign' },
        { status: 400 }
      )
    }

    // Create contribution event for adding the tag
    const tagEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'tag_update',
          operation: 'add',
          tagName: trimmedTag,
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

    // Count total usage of this tag
    const tagCountGlobal = await prisma.contributionEvent.count({
      where: {
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['tagName'],
          equals: trimmedTag,
        },
        AND: [
          {
            metadata: {
              path: ['action'],
              equals: 'tag_update',
            },
          },
          {
            metadata: {
              path: ['operation'],
              equals: 'add',
            },
          },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        name: trimmedTag,
        addedBy: {
          id: tagEvent.user.id,
          displayName: tagEvent.user.displayName,
          avatar: tagEvent.user.avatar,
          handle: tagEvent.user.handle,
        },
        addedAt: tagEvent.createdAt.toISOString(),
        count: tagCountGlobal,
      },
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/tags]', error)
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/campaigns/[id]/tags
// ============================================================================
// Remove a tag from a campaign (creator-only)
export async function DELETE(
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

    const campaignId = params.id
    const { tagName } = await request.json()

    // Validate input
    if (!tagName || typeof tagName !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    const trimmedTag = tagName.trim().toLowerCase()

    // Verify campaign exists and get creator info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can remove tags' },
        { status: 403 }
      )
    }

    // Find the tag event to remove
    const tagEvent = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['tagName'],
          equals: trimmedTag,
        },
        AND: [
          {
            metadata: {
              path: ['action'],
              equals: 'tag_update',
            },
          },
          {
            metadata: {
              path: ['operation'],
              equals: 'add',
            },
          },
        ],
      },
    })

    if (!tagEvent) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Create a deletion event instead of actually deleting the record
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0, // No points for removal
        metadata: {
          action: 'tag_update',
          operation: 'remove',
          tagName: trimmedTag,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Tag removed successfully',
    })
  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]/tags]', error)
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    )
  }
}
