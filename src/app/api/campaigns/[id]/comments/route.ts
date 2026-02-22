import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Rate limiting: max 10 comments per hour per user per campaign
const RATE_LIMIT_COMMENTS = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// Helper to check rate limit
async function checkRateLimit(userId: string, campaignId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)

  const recentCommentCount = await prisma.comment.count({
    where: {
      userId,
      campaignId,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  })

  return recentCommentCount < RATE_LIMIT_COMMENTS
}

// GET /api/campaigns/[id]/comments - List comments for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'))
    const sort = searchParams.get('sort') || 'newest' // newest or oldest
    const updateId = searchParams.get('updateId')

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

    const skip = (page - 1) * limit
    const orderBy = sort === 'oldest' ? 'asc' : 'desc'

    // Get top-level comments (no parent)
    const comments = await prisma.comment.findMany({
      where: {
        campaignId,
        parentId: null,
        status: 'VISIBLE',
        ...(updateId ? { updateId } : {}),
      },
      orderBy: {
        createdAt: orderBy as 'asc' | 'desc',
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            handle: true,
          },
        },
        replies: {
          where: { status: 'VISIBLE' },
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit replies per comment
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
        },
      },
    })

    // Count total top-level comments
    const total = await prisma.comment.count({
      where: {
        campaignId,
        parentId: null,
        status: 'VISIBLE',
        ...(updateId ? { updateId } : {}),
      },
    })

    // Enhance with reply counts
    const enhancedComments = comments.map((comment) => ({
      ...comment,
      replyCount: comment.replies.length,
    }))

    return NextResponse.json({
      comments: enhancedComments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/comments]', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/comments - Create a comment
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
    const { content, parentId, updateId } = body

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

    // Check campaign exists
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

    // If updateId provided, validate it exists and belongs to this campaign
    if (updateId) {
      const update = await prisma.campaignUpdate.findFirst({
        where: { id: updateId, campaignId },
        select: { id: true },
      })
      if (!update) {
        return NextResponse.json({ error: 'Update not found' }, { status: 404 })
      }
    }

    // If replying to a comment, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, campaignId: true },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      if (parentComment.campaignId !== campaignId) {
        return NextResponse.json(
          { error: 'Parent comment is not from this campaign' },
          { status: 400 }
        )
      }
    }

    // Check rate limit
    const isWithinRateLimit = await checkRateLimit(user.id, campaignId)
    if (!isWithinRateLimit) {
      return NextResponse.json(
        { error: 'You have reached the comment limit. Please try again later.' },
        { status: 429 }
      )
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        campaignId,
        userId: user.id,
        parentId: parentId || null,
        updateId: updateId || null,
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

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/comments]', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
