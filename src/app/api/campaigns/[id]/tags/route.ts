import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface TagData {
  id: string
  name: string
  color: string
  count: number
  createdAt: string
}

interface ContributionEventMetadata {
  action: string
  tagName: string
  tagColor: string
}

/**
 * GET /api/campaigns/[id]/tags
 * Fetch all tags for a campaign from ContributionEvent
 */
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

    // Fetch tag events from ContributionEvent
    const tagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Parse and aggregate tags from metadata
    const tagMap = new Map<string, TagData>()

    tagEvents.forEach((event) => {
      const metadata = event.metadata as unknown as {
        action?: string
        tagName?: string
        tagColor?: string
        campaignTagId?: string
      } | null

      if (metadata?.action === 'campaign_tag' && metadata.tagName) {
        const tagKey = metadata.tagName.toLowerCase()
        const tagId = metadata.campaignTagId || `tag_${tagKey}`

        if (!tagMap.has(tagKey)) {
          tagMap.set(tagKey, {
            id: tagId,
            name: metadata.tagName,
            color: metadata.tagColor || 'blue',
            count: 0,
            createdAt: event.createdAt.toISOString(),
          })
        }

        const tag = tagMap.get(tagKey)!
        tag.count += 1
      }
    })

    const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count)

    // Get popular tags from all campaigns for suggestions
    const allTagEvents = await prisma.contributionEvent.findMany({
      where: {
        eventType: 'SOCIAL_SHARE',
      },
      orderBy: { createdAt: 'desc' },
      take: 5000, // Limit to avoid performance issues
    })

    const popularTagMap = new Map<string, TagData>()

    allTagEvents.forEach((event) => {
      const metadata = event.metadata as unknown as {
        action?: string
        tagName?: string
        tagColor?: string
      } | null

      if (metadata?.action === 'campaign_tag' && metadata.tagName) {
        const tagKey = metadata.tagName.toLowerCase()

        if (!popularTagMap.has(tagKey)) {
          popularTagMap.set(tagKey, {
            id: `popular_${tagKey}`,
            name: metadata.tagName,
            color: metadata.tagColor || 'blue',
            count: 0,
            createdAt: new Date().toISOString(),
          })
        }

        const tag = popularTagMap.get(tagKey)!
        tag.count += 1
      }
    })

    const popularTags = Array.from(popularTagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    return NextResponse.json({
      tags,
      popularTags,
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/tags
 * Add a tag to a campaign
 */
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
    const { name, color } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

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

    // Fetch existing tags to check limit and duplicates
    const existingTagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    const existingTags = new Set<string>()
    existingTagEvents.forEach((event) => {
      const metadata = event.metadata as unknown as {
        action?: string
        tagName?: string
      } | null
      if (metadata?.action === 'campaign_tag' && metadata.tagName) {
        existingTags.add(metadata.tagName.toLowerCase())
      }
    })

    // Check if tag already exists
    if (existingTags.has(name.toLowerCase())) {
      return NextResponse.json(
        { error: 'This tag already exists for this campaign' },
        { status: 400 }
      )
    }

    // Check tag limit (20 tags per campaign)
    if (existingTags.size >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 tags per campaign' },
        { status: 400 }
      )
    }

    // Create a new tag via ContributionEvent
    const tagId = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const colorValue = color || 'blue'

    const newEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'campaign_tag',
          tagName: name.trim(),
          tagColor: colorValue,
          campaignTagId: tagId,
        },
      },
    })

    // Return updated tags list
    const tagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    const tagMap = new Map<string, TagData>()

    tagEvents.forEach((event) => {
      const metadata = event.metadata as unknown as {
        action?: string
        tagName?: string
        tagColor?: string
        campaignTagId?: string
      } | null

      if (metadata?.action === 'campaign_tag' && metadata.tagName) {
        const tagKey = metadata.tagName.toLowerCase()
        const id = metadata.campaignTagId || `tag_${tagKey}`

        if (!tagMap.has(tagKey)) {
          tagMap.set(tagKey, {
            id,
            name: metadata.tagName,
            color: metadata.tagColor || 'blue',
            count: 0,
            createdAt: event.createdAt.toISOString(),
          })
        }

        const tag = tagMap.get(tagKey)!
        tag.count += 1
      }
    })

    const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count)

    return NextResponse.json({ tags }, { status: 201 })
  } catch (error) {
    console.error('Error adding tag:', error)
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]/tags
 * Remove a tag from a campaign
 */
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
    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

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

    // Find and delete the tag event(s) matching the tag ID
    const tagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    // Find events with the matching tag
    let deleteCount = 0
    for (const event of tagEvents) {
      const metadata = event.metadata as unknown as {
        campaignTagId?: string
      } | null
      if (metadata?.campaignTagId === tagId) {
        await prisma.contributionEvent.delete({
          where: { id: event.id },
        })
        deleteCount += 1
        break // Delete only the first match (one tag entry)
      }
    }

    if (deleteCount === 0) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Return updated tags list
    const updatedTagEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    const tagMap = new Map<string, TagData>()

    updatedTagEvents.forEach((event) => {
      const metadata = event.metadata as unknown as {
        action?: string
        tagName?: string
        tagColor?: string
        campaignTagId?: string
      } | null

      if (metadata?.action === 'campaign_tag' && metadata.tagName) {
        const tagKey = metadata.tagName.toLowerCase()
        const id = metadata.campaignTagId || `tag_${tagKey}`

        if (!tagMap.has(tagKey)) {
          tagMap.set(tagKey, {
            id,
            name: metadata.tagName,
            color: metadata.tagColor || 'blue',
            count: 0,
            createdAt: event.createdAt.toISOString(),
          })
        }

        const tag = tagMap.get(tagKey)!
        tag.count += 1
      }
    })

    const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
