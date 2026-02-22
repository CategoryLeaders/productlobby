import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Edit window: 15 minutes
const EDIT_WINDOW_MS = 15 * 60 * 1000

// PATCH /api/campaigns/[id]/comments/[commentId] - Edit comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { commentId } = params
    const body = await request.json()
    const { content } = body

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 1 and 2000 characters' },
        { status: 400 }
      )
    }

    // Get comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (comment.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Check if edit window has passed
    const timeSinceCreation = Date.now() - new Date(comment.createdAt).getTime()
    if (timeSinceCreation > EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'You can only edit comments within 15 minutes of posting' },
        { status: 403 }
      )
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: trimmedContent,
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

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('[PATCH /api/campaigns/[id]/comments/[commentId]]', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId, commentId } = params

    // Get comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        campaignId: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Verify campaign ID matches
    if (comment.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Comment not found in this campaign' },
        { status: 404 }
      )
    }

    // Check authorization: comment owner or campaign creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorUserId: true },
    })

    const isOwner = comment.userId === user.id
    const isCampaignCreator = campaign?.creatorUserId === user.id

    if (!isOwner && !isCampaignCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      )
    }

    // Soft delete - set status to HIDDEN
    const deletedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        status: 'HIDDEN',
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

    return NextResponse.json(deletedComment)
  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]/comments/[commentId]]', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
