import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = Promise<{ id: string; mediaId: string }>

// PATCH /api/campaigns/[id]/media/[mediaId]
// Update media (e.g., reorder)
export async function PATCH(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, mediaId } = await props.params
    const body = await request.json()
    const { order } = body

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const media = await prisma.campaignMedia.findUnique({
      where: { id: mediaId },
    })

    if (!media || media.campaignId !== id) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Update media
    const updatedMedia = await prisma.campaignMedia.update({
      where: { id: mediaId },
      data: {
        ...(typeof order === 'number' && { order }),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedMedia,
    })
  } catch (error) {
    console.error('PATCH /api/campaigns/[id]/media/[mediaId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Params }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, mediaId } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const media = await prisma.campaignMedia.findUnique({
      where: { id: mediaId },
    })

    if (!media || media.campaignId !== id) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    await prisma.campaignMedia.delete({
      where: { id: mediaId },
    })

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/campaigns/[id]/media/[mediaId] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
