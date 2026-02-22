import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/users/[handle] - Get public user profile data
export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      )
    }

    // Fetch user with their campaigns and lobbies
    const user = await prisma.user.findUnique({
      where: { handle },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        createdAt: true,
        twitterHandle: true,
        instagramHandle: true,
        tiktokHandle: true,
        linkedinHandle: true,
        location: true,
        website: true,
        campaigns: {
          where: { status: 'LIVE' },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            category: true,
            createdAt: true,
            media: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true },
            },
            _count: {
              select: { lobbies: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        lobbies: {
          select: {
            campaignId: true,
            campaign: {
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                category: true,
                createdAt: true,
                creatorUserId: true,
                media: {
                  take: 1,
                  orderBy: { order: 'asc' },
                  select: { url: true },
                },
                _count: {
                  select: { lobbies: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          select: { id: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Count unique campaigns the user lobbied for
    const lobbiedCampaigns = user.lobbies.map((l) => l.campaign)
    const uniqueLobbyingCampaigns = Array.from(
      new Map(lobbiedCampaigns.map((c) => [c.id, c])).values()
    )

    // Format response
    const response = {
      id: user.id,
      displayName: user.displayName,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio,
      joinDate: user.createdAt,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      tiktokHandle: user.tiktokHandle,
      linkedinHandle: user.linkedinHandle,
      location: user.location,
      website: user.website,
      stats: {
        campaignsCreated: user.campaigns.length,
        campaignsSupported: uniqueLobbyingCampaigns.length,
        commentsMade: user.comments.length,
      },
      campaigns: user.campaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        image: c.media[0]?.url,
        lobbyCount: c._count.lobbies,
        createdAt: c.createdAt,
      })),
      lobbiedCampaigns: uniqueLobbyingCampaigns.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        category: c.category,
        image: c.media[0]?.url,
        lobbyCount: c._count.lobbies,
        createdAt: c.createdAt,
        creatorId: c.creatorUserId,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
