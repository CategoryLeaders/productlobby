import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface FeedItemData {
  id: string
  type: 'campaign_created' | 'lobby' | 'comment'
  data: {
    id: string
    title?: string
    content?: string
    status?: string
    category?: string
  }
  user: {
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
  }
  campaignData: {
    id: string
    title: string
    slug: string
    lobbyCount: number
  } | null
  createdAt: Date
}

/**
 * GET /api/feed
 * Returns personalized feed of activity from users you follow
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const skip = (page - 1) * limit

    // Get users that the current user follows (through campaigns)
    const followedCampaigns = await prisma.follow.findMany({
      where: { userId: user.id },
      select: { campaign: { select: { creatorUserId: true } } },
    })

    const followedUserIds = [
      ...new Set(followedCampaigns.map((f) => f.campaign.creatorUserId)),
    ]

    if (followedUserIds.length === 0) {
      // No one followed yet
      return NextResponse.json({
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      })
    }

    let feedItems: FeedItemData[] = []

    // 1. Get campaigns created by followed users
    const campaigns = await prisma.campaign.findMany({
      where: {
        creatorUserId: { in: followedUserIds },
        status: 'LIVE', // Only include live campaigns
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        _count: {
          select: { lobbies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    feedItems.push(
      ...campaigns.map((c) => ({
        id: `campaign_${c.id}`,
        type: 'campaign_created' as const,
        data: {
          id: c.id,
          title: c.title,
          category: c.category,
          status: 'LIVE',
        },
        user: c.creator,
        campaignData: {
          id: c.id,
          title: c.title,
          slug: c.slug,
          lobbyCount: c._count.lobbies,
        },
        createdAt: c.createdAt,
      }))
    )

    // 2. Get lobbies from followed users
    const lobbies = await prisma.lobby.findMany({
      where: { userId: { in: followedUserIds } },
      select: {
        id: true,
        intensity: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            _count: { select: { lobbies: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    feedItems.push(
      ...lobbies.map((l) => ({
        id: `lobby_${l.id}`,
        type: 'lobby' as const,
        data: {
          id: l.id,
          content: `lobbied for this campaign (${l.intensity.toLowerCase().replace(/_/g, ' ')})`,
        },
        user: l.user,
        campaignData: {
          id: l.campaign.id,
          title: l.campaign.title,
          slug: l.campaign.slug,
          lobbyCount: l.campaign._count.lobbies,
        },
        createdAt: l.createdAt,
      }))
    )

    // 3. Get comments from followed users
    const comments = await prisma.comment.findMany({
      where: {
        userId: { in: followedUserIds },
        status: 'VISIBLE',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            _count: { select: { lobbies: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    feedItems.push(
      ...comments.map((c) => ({
        id: `comment_${c.id}`,
        type: 'comment' as const,
        data: {
          id: c.id,
          content: c.content,
        },
        user: c.user,
        campaignData: {
          id: c.campaign.id,
          title: c.campaign.title,
          slug: c.campaign.slug,
          lobbyCount: c.campaign._count.lobbies,
        },
        createdAt: c.createdAt,
      }))
    )

    // Sort by createdAt descending
    feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination
    const paginatedItems = feedItems.slice(skip, skip + limit)
    const totalCount = feedItems.length

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/feed]', error)
    return NextResponse.json(
      { error: 'Failed to load feed' },
      { status: 500 }
    )
  }
}
