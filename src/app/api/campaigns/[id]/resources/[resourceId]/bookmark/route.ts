import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// POST /api/campaigns/[id]/resources/[resourceId]/bookmark
// ============================================================================
// Toggle bookmark status for a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; resourceId: string } }
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
    const resourceId = params.resourceId

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const { bookmarked } = await request.json()

    if (bookmarked) {
      // Create bookmark
      await prisma.bookmark.upsert({
        where: {
          userId_itemId_itemType: {
            userId: user.id,
            itemId: resourceId,
            itemType: 'RESOURCE',
          },
        },
        update: {},
        create: {
          userId: user.id,
          itemId: resourceId,
          itemType: 'RESOURCE',
        },
      })

      return NextResponse.json({ bookmarked: true })
    } else {
      // Remove bookmark
      await prisma.bookmark.deleteMany({
        where: {
          userId: user.id,
          itemId: resourceId,
          itemType: 'RESOURCE',
        },
      })

      return NextResponse.json({ bookmarked: false })
    }
  } catch (error) {
    console.error('Error updating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}
