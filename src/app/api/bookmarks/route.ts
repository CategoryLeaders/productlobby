import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/bookmarks - Toggle bookmark (create if not exists, delete if exists)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 }
      )
    }

    // Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId,
        },
      },
    })

    if (existingBookmark) {
      // Delete the bookmark
      await prisma.bookmark.delete({
        where: {
          userId_campaignId: {
            userId: user.id,
            campaignId,
          },
        },
      })

      return NextResponse.json({ bookmarked: false }, { status: 200 })
    } else {
      // Create the bookmark
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          campaignId,
        },
      })

      return NextResponse.json({ bookmarked: true }, { status: 201 })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    )
  }
}

// GET /api/bookmarks - Get all bookmarked campaigns for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                avatar: true,
                email: true,
              },
            },
            targetedBrand: {
              select: {
                id: true,
                name: true,
                logo: true,
                slug: true,
              },
            },
            media: {
              take: 1,
              orderBy: { order: 'asc' },
            },
            _count: {
              select: {
                lobbies: true,
                pledges: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to match campaign card format
    const campaigns = bookmarks.map((bookmark) => ({
      id: bookmark.campaign.id,
      title: bookmark.campaign.title,
      slug: bookmark.campaign.slug,
      description: bookmark.campaign.description,
      category: bookmark.campaign.category,
      status: bookmark.campaign.status.toLowerCase(),
      signalScore: bookmark.campaign.signalScore,
      completenessScore: bookmark.campaign.completenessScore,
      createdAt: bookmark.campaign.createdAt,
      updatedAt: bookmark.campaign.updatedAt,
      image: bookmark.campaign.media[0]?.url,
      creator: bookmark.campaign.creator,
      targetedBrand: bookmark.campaign.targetedBrand,
      lobbyCount: bookmark.campaign._count.lobbies,
      pledgeCount: bookmark.campaign._count.pledges,
    }))

    return NextResponse.json({ campaigns }, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}
