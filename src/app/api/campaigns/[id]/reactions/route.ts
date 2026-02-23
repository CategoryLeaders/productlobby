import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type ReactionType = 'fire' | 'heart' | 'thumbsup' | 'rocket' | 'eyes' | 'party'

const VALID_REACTIONS: ReactionType[] = [
  'fire',
  'heart',
  'thumbsup',
  'rocket',
  'eyes',
  'party',
]

interface ReactionCounts {
  fire: number
  heart: number
  thumbsup: number
  rocket: number
  eyes: number
  party: number
}

// ============================================================================
// GET /api/campaigns/[id]/reactions
// ============================================================================
// Returns reaction counts and user's own reactions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get current user (may be null for unauthenticated users)
    const user = await getCurrentUser()

    // Get all reactions for this campaign
    const reactions = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'reaction',
        },
      },
      select: {
        id: true,
        userId: true,
        metadata: true,
      },
    })

    // Count reactions by type
    const counts: ReactionCounts = {
      fire: 0,
      heart: 0,
      thumbsup: 0,
      rocket: 0,
      eyes: 0,
      party: 0,
    }

    const userReactions: Record<string, boolean> = {}

    for (const reaction of reactions) {
      const type = reaction.metadata?.type as ReactionType
      if (type && VALID_REACTIONS.includes(type)) {
        counts[type]++

        // Track user's reactions
        if (user && reaction.userId === user.id) {
          userReactions[type] = true
        }
      }
    }

    return NextResponse.json({
      success: true,
      counts,
      userReactions,
    })
  } catch (error) {
    console.error('Get reactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/reactions
// ============================================================================
// Toggle a reaction (add if not exists, remove if exists)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const campaignId = params.id

    const body = await request.json()
    const { type } = body as { type: unknown }

    // Validate reaction type
    if (!type || !VALID_REACTIONS.includes(type as ReactionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    const reactionType = type as ReactionType

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user already has this reaction
    const existingReaction = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'reaction',
        },
        AND: [
          {
            metadata: {
              path: ['type'],
              equals: reactionType,
            },
          },
        ],
      },
    })

    if (existingReaction) {
      // Remove reaction
      await prisma.contributionEvent.delete({
        where: { id: existingReaction.id },
      })
    } else {
      // Add reaction
      await prisma.contributionEvent.create({
        data: {
          campaignId,
          userId: user.id,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            action: 'reaction',
            type: reactionType,
          },
        },
      })
    }

    // Get updated counts and user reactions
    const reactions = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'reaction',
        },
      },
      select: {
        userId: true,
        metadata: true,
      },
    })

    const counts: ReactionCounts = {
      fire: 0,
      heart: 0,
      thumbsup: 0,
      rocket: 0,
      eyes: 0,
      party: 0,
    }

    const userReactions: Record<string, boolean> = {}

    for (const reaction of reactions) {
      const reactionTypeFromDb = reaction.metadata?.type as ReactionType
      if (reactionTypeFromDb && VALID_REACTIONS.includes(reactionTypeFromDb)) {
        counts[reactionTypeFromDb]++

        if (reaction.userId === user.id) {
          userReactions[reactionTypeFromDb] = true
        }
      }
    }

    return NextResponse.json({
      success: true,
      counts,
      userReactions,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Toggle reaction error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
