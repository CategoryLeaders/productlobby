import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/campaigns/[id]/export/[exportId]/cancel - Cancel export
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; exportId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id, exportId } = params

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Find export event
    const exportEvent = await prisma.contributionEvent.findUnique({
      where: { id: exportId },
      select: {
        metadata: true,
        campaignId: true,
      },
    })

    if (!exportEvent) {
      return NextResponse.json(
        { error: 'Export not found' },
        { status: 404 }
      )
    }

    if (exportEvent.campaignId !== id) {
      return NextResponse.json(
        { error: 'Export does not belong to this campaign' },
        { status: 400 }
      )
    }

    const metadata = (exportEvent.metadata as Record<string, any>) || {}

    // Check if export is already completed or failed
    if (metadata.status === 'completed' || metadata.status === 'failed') {
      return NextResponse.json(
        { error: `Cannot cancel export with status: ${metadata.status}` },
        { status: 400 }
      )
    }

    // Update export status to failed
    await prisma.contributionEvent.update({
      where: { id: exportId },
      data: {
        metadata: {
          ...metadata,
          status: 'failed',
          error: 'Cancelled by user',
        },
      },
    })

    return NextResponse.json(
      { message: 'Export cancelled successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/export/[exportId]/cancel]', error)
    return NextResponse.json(
      { error: 'Failed to cancel export' },
      { status: 500 }
    )
  }
}
