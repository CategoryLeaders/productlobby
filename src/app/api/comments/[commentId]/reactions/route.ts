import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const VALID_REACTIONS = ['thumbsup', 'heart', 'laugh', 'surprised', 'sad']

interface ReactionCounts {
  thumbsup: number
  heart: number
  laugh: number
  surprised: number
  sad: number
}

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
    const { reaction } = body

    if (!reaction || !VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
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
          path: ['action'],
          equals: 'comment_reaction',
        },
      },
    })

    let userReaction: string | null = null

    if (existingReaction) {
      const existingMeta = existingReaction.metadata as any
      const existingType = existingMeta?.reaction

      if (existingType === reaction) {
        // User is removing their reaction
        await prisma.contributionEvent.delete({
          where: { id: existingReaction.id },
        })
        userReaction = null
      } else {
        // User is changing their reaction
        await prisma.contributionEvent.update({
          where: { id: existingReaction.id },
          data: {
            metadata: {
              action: 'comment_reaction',
              commentId,
              reaction,
              timestamp: new Date().toISOString(),
            },
          },
        })
        userReaction = reaction
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
            action: 'comment_reaction',
            commentId,
            reaction,
            timestamp: new Date().toISOString(),
          },
        },
      })
      userReaction = reaction
    }

    // Get updated reaction counts
    const reactions = await prisma.contributionEvent.findMany({
      where: {
        campaignId: comment.campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'comment_reaction',
        },
      },
      select: {
        metadata: true,
      },
    })

    const counts: ReactionCounts = {
      thumbsup: 0,
      heart: 0,
      laugh: 0,
      surprised: 0,
      sad: 0,
    }

    reactions.forEach((r) => {
      const meta = r.metadata as any
      const reactionType = meta?.reaction
      if (reactionType && reactionType in counts) {
        counts[reactionType as keyof ReactionCounts]++
      }
    })

    return NextResponse.json(
      {
        reactions: counts,
        userReaction,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error toggling comment reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle reaction' },
      { status: 500 }
    )
  }
}

// GET /api/comments/[commentId]/reactions - Get reaction counts and user's reactions
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
          path: ['action'],
          equals: 'comment_reaction',
        },
      },
      select: {
        userId: true,
        metadata: true,
      },
    })

    // Count reactions by type
    const counts: ReactionCounts = {
      thumbsup: 0,
      heart: 0,
      laugh: 0,
      surprised: 0,
      sad: 0,
    }

    reactions.forEach((r) => {
      const meta = r.metadata as any
      const reactionType = meta?.reaction
      if (reactionType && reactionType in counts) {
        counts[reactionType as keyof ReactionCounts]++
      }
    })

    // Get user's current reaction if authenticated
    let userReaction: string | null = null
    if (user) {
      const userReact = reactions.find((r) => r.userId === user.id)
      if (userReact) {
        const meta = userReact.metadata as any
        userReaction = meta?.reaction || null
      }
    }

    return NextResponse.json(
      {
        reactions: counts,
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
