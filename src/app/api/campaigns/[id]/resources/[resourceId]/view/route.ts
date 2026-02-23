import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// POST /api/campaigns/[id]/resources/[resourceId]/view
// ============================================================================
// Record a view event for a resource
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
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

    // Find the resource event and increment view count
    const resourceEvent = await prisma.contributionEvent.findFirst({
      where: {
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['resourceId'],
          equals: resourceId,
        },
      },
    })

    if (!resourceEvent) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Update view count in metadata
    const metadata = resourceEvent.metadata as any
    const currentViewCount = metadata.viewCount || 0

    await prisma.contributionEvent.update({
      where: { id: resourceEvent.id },
      data: {
        metadata: {
          ...metadata,
          viewCount: currentViewCount + 1,
        },
      },
    })

    return NextResponse.json({ success: true, viewCount: currentViewCount + 1 })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
