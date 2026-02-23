/**
 * Campaign Discussion Threads API
 * GET /api/campaigns/[id]/threads - Get discussion threads for a campaign
 * POST /api/campaigns/[id]/threads - Create a new discussion thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/threads
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Get discussion threads (using Comment model as discussion container)
    const threads = await prisma.comment.findMany({
      where: {
        campaignId,
        parentId: null, // Only top-level comments are threads
      },
      select: {
        id: true,
        content: true,
        userId: true,
        user: {
          select: {
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get reply counts for each thread
    const threadsWithCounts = await Promise.all(
      threads.map(async (thread) => {
        const replyCount = await prisma.comment.count({
          where: {
            campaignId,
            parentId: thread.id,
          },
        })

        const lastReply = await prisma.comment.findFirst({
          where: {
            campaignId,
            parentId: thread.id,
          },
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
        })

        return {
          ...thread,
          replyCount,
          lastActivity: lastReply?.createdAt || thread.createdAt,
        }
      })
    )

    // Get total count
    const totalCount = await prisma.comment.count({
      where: {
        campaignId,
        parentId: null,
      },
    })

    return NextResponse.json({
      success: true,
      data: threadsWithCounts,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Threads GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/threads
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const body = await request.json()
    const { title, body: content } = body

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and body are required',
        },
        { status: 400 }
      )
    }

    if (title.length > 280 || content.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title too long (max 280) or body too long (max 5000)',
        },
        { status: 400 }
      )
    }

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

    // Create thread (store as Comment with title in content)
    const thread = await prisma.comment.create({
      data: {
        campaignId,
        userId: user.id,
        content: `# ${title}\n\n${content}`,
        status: 'VISIBLE',
      },
      select: {
        id: true,
        content: true,
        userId: true,
        user: {
          select: {
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    })

    // Create contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 10,
        metadata: {
          action: 'discussion_thread',
          threadId: thread.id,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...thread,
        replyCount: 0,
        lastActivity: thread.createdAt,
      },
    })
  } catch (error) {
    console.error('Threads POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create thread' },
      { status: 500 }
    )
  }
}
