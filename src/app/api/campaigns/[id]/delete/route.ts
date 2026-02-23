import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/campaigns/[id]/delete - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { permanent = false } = body

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        creatorUserId: true,
        slug: true,
        status: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can delete' },
        { status: 403 }
      )
    }

    if (permanent) {
      // Hard delete - remove all related data and campaign itself
      await prisma.campaign.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Campaign permanently deleted',
      })
    } else {
      // Soft delete - set status to CLOSED (archived state)
      const deletedCampaign = await prisma.campaign.update({
        where: { id },
        data: {
          status: 'CLOSED',
        },
        select: {
          id: true,
          slug: true,
          status: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Campaign archived (soft deleted)',
        campaign: deletedCampaign,
      })
    }
  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]/delete]', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
