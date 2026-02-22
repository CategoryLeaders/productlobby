import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notifyNewUpdate } from '@/lib/notifications'

// POST /api/campaigns/[id]/updates - Create campaign update
export async function POST(
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

    const { id: campaignId } = params
    const body = await request.json()
    const { title, content } = body

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
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
        { error: 'Unauthorized - only campaign creator can post updates' },
        { status: 403 }
      )
    }

    // Create update
    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId,
        title,
        content,
        creatorUserId: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Notify all campaign followers of the new update
    await notifyNewUpdate(campaignId, title)

    return NextResponse.json(update, { status: 201 })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/updates]', error)
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    )
  }
}

// GET /api/campaigns/[id]/updates - List campaign updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Check if campaign exists
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

    const updates = await prisma.campaignUpdate.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      updates,
      total: updates.length,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/updates]', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}
