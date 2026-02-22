import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ============================================================================
// GET: List all user's favourited campaigns
// ============================================================================

export async function GET() {
  try {
    const user = await requireAuth()

    // Fetch user's favourite campaigns with related data
    const favourites = await prisma.favourite.findMany({
      where: { userId: user.id },
      include: {
        campaign: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true,
              },
            },
            targetedBrand: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            media: {
              where: { kind: 'IMAGE' },
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

    // Transform the data to match campaign card format
    const campaigns = favourites.map((fav) => {
      const campaign = fav.campaign
      const image = campaign.media[0]?.url

      // Fetch lobby intensity distribution
      return {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        description: campaign.description,
        category: campaign.category,
        image,
        lobbyCount: campaign._count.lobbies,
        completenessScore: campaign.completenessScore,
        status: campaign.status.toLowerCase(),
        creator: campaign.creator,
        brand: campaign.targetedBrand,
        createdAt: campaign.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: campaigns,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Get user favourites error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
