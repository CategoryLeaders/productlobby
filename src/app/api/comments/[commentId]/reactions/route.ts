import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/comments/[commentId]/reactions - Toggle reaction on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
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
    const { type } = body // 'like' or 'dislike'

    if (!type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type. Must be "like" or "dislike"' },
        { status: 400 }
      )
    }

    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { campaignId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user already has a reaction to this comment
    const existingReaction = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId: comment.campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['commentId'],
          equals: commentId,
        },
      },
    })

    if (existingReaction) {
      // Check if it's the same type
      const existingType = (existingReaction.metadata as any)?.reactionType
      if (existingType === type) {
        // User is removing their reaction
        await prisma.contributionEvent.delete({
          where: { id: existingReaction.id },
        })
        return NextResponse.json(
          { reacted: false, type: null },
          { status: 200 }
        )
      } else {
        // User is changing their reaction
        await prisma.contributionEvent.update({
          where: { id: existingReaction.id },
          data: {
            metadata: {
              commentId,
              reactionType: type,
              timestamp: new Date().toISOString(),
            },
          },
        })
        return NextResponse.json(
          { reacted: true, type },
          { status: 200 }
        )
      }
    } else {
      // Create new reaction
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId: comment.campaignId,
          eventType: 'SOCIAL_SHARE',
          points: 1,
          metadata: {
            commentId,
            reactionType: type,
            timestamp: new Date().toISOString(),
          },
        },
      })

      return NextResponse.json(
        { reacted: true, type },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error toggling comment reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}

// GET /api/comments/[commentId]/reactions - Get reaction counts and user's reaction
export async function GET(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const user = await getCurrentUser()
    const { commentId } = params

    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { campaignId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Get all reactions for this comment
    const reactions = await prisma.contributionEvent.findMany({
      where: {
        campaignId: comment.campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['commentId'],
          equals: commentId,
        },
      },
      select: {
        metadata: true,
      },
    })

    // Count likes and dislikes
    const counts = {
      likes: 0,
      dislikes: 0,
    }

    reactions.forEach((reaction) => {
      const meta = reaction.metadata as any
      if (meta?.reactionType === 'like') {
        counts.likes++
      } else if (meta?.reactionType === 'dislike') {
        counts.dislikes++
      }
    })

    // Get user's current reaction if authenticated
    let userReaction = null
    if (user) {
      const userReact = reactions.find(
        (r) => (r.metadata as any)?.userId === user.id
      )
      if (userReact) {
        userReaction = (userReact.metadata as any)?.reactionType
      }
    }

    return NextResponse.json(
      {
        likes: counts.likes,
        dislikes: counts.dislikes,
        userReaction,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching comment reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}
