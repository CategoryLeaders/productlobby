export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// DELETE /api/campaigns/[id]/content-library/[contentId]
// Delete a content item from the library
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; contentId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const contentId = params.contentId

    // Verify user has access to this campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorId: true, id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this campaign' },
        { status: 403 }
      )
    }

    // Verify the content item exists and belongs to this campaign
    const contentItem = await prisma.campaignMetadata.findUnique({
      where: { id: contentId },
    })

    if (!contentItem || contentItem.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      )
    }

    // Delete the content item
    await prisma.campaignMetadata.delete({
      where: { id: contentId },
    })

    // Log contribution event
    const itemData = typeof contentItem.metaValue === 'string'
      ? JSON.parse(contentItem.metaValue)
      : contentItem.metaValue

    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          action: 'delete_content_library_item',
          contentTitle: itemData?.title || 'Unknown',
          timestamp: new Date().toISOString(),
        },
      },
    }).catch(() => {
      // Silently fail if event logging fails
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
