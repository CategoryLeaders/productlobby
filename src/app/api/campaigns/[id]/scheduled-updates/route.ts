export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updates = await prisma.campaignUpdate.findMany({
      where: { campaignId },
      select: {
        id: true,
        title: true,
        content: true,
        updateType: true,
        scheduledFor: true,
        createdAt: true,
      },
      orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'desc' }],
    })

    const formattedUpdates = updates.map((update) => {
      let status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' = 'DRAFT'
      
      if (update.scheduledFor) {
        const now = new Date()
        const scheduledTime = new Date(update.scheduledFor)
        
        if (scheduledTime <= now) {
          status = 'PUBLISHED'
        } else {
          status = 'SCHEDULED'
        }
      }

      return {
        id: update.id,
        title: update.title,
        content: update.content,
        updateType: update.updateType || 'ANNOUNCEMENT',
        status,
        scheduledFor: update.scheduledFor,
        createdAt: update.createdAt,
        publishedAt: status === 'PUBLISHED' ? update.scheduledFor : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedUpdates,
    })
  } catch (error) {
    console.error('Error fetching scheduled updates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduled updates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { id: updateId, title, content, updateType, scheduledFor } = body

    if (!title || !content || !updateType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        title: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let update

    if (updateId) {
      // Update existing update
      update = await prisma.campaignUpdate.update({
        where: { id: updateId },
        data: {
          title,
          content,
          updateType,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        },
        select: {
          id: true,
          title: true,
          content: true,
          updateType: true,
          scheduledFor: true,
          createdAt: true,
        },
      })
    } else {
      // Create new update
      update = await prisma.campaignUpdate.create({
        data: {
          campaignId,
          creatorUserId: user.id,
          title,
          content,
          updateType,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        },
        select: {
          id: true,
          title: true,
          content: true,
          updateType: true,
          scheduledFor: true,
          createdAt: true,
        },
      })

      // Log contribution event for scheduling
      if (scheduledFor) {
        await prisma.contributionEvent.create({
          data: {
            userId: user.id,
            campaignId,
            eventType: 'SOCIAL_SHARE',
            points: 5,
            metadata: {
              action: 'schedule_update',
              updateId: update.id,
              updateType: updateType,
              scheduledFor: scheduledFor,
            },
          },
        })
      }
    }

    let status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' = 'DRAFT'
    if (update.scheduledFor) {
      const now = new Date()
      const scheduledTime = new Date(update.scheduledFor)
      if (scheduledTime <= now) {
        status = 'PUBLISHED'
      } else {
        status = 'SCHEDULED'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: update.id,
        title: update.title,
        content: update.content,
        updateType: update.updateType || 'ANNOUNCEMENT',
        status,
        scheduledFor: update.scheduledFor,
        createdAt: update.createdAt,
        publishedAt: status === 'PUBLISHED' ? update.scheduledFor : null,
      },
    })
  } catch (error) {
    console.error('Error creating/updating scheduled update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save scheduled update' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { id: updateId } = body

    if (!updateId) {
      return NextResponse.json(
        { success: false, error: 'Update ID is required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const update = await prisma.campaignUpdate.findUnique({
      where: { id: updateId },
      select: { campaignId: true },
    })

    if (!update || update.campaignId !== campaignId) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      )
    }

    await prisma.campaignUpdate.delete({
      where: { id: updateId },
    })

    return NextResponse.json({
      success: true,
      message: 'Update deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting scheduled update:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete scheduled update' },
      { status: 500 }
    )
  }
}
