import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET /api/brands/[slug] - Fetch brand by slug with campaigns and stats
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params

    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        campaigns: {
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                handle: true,
                avatar: true,
                email: true,
              },
            },
            media: {
              take: 1,
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { lobbies: true, follows: true },
            },
          },
        },
      },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Calculate aggregate stats
    const totalLobbies = brand.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.lobbies,
      0
    )
    const totalFollows = brand.campaigns.reduce(
      (sum, campaign) => sum + campaign._count.follows,
      0
    )
    const activeCampaigns = brand.campaigns.filter(
      (c) => c.status === 'LIVE'
    ).length

    return NextResponse.json({
      success: true,
      data: {
        ...brand,
        stats: {
          totalCampaigns: brand.campaigns.length,
          activeCampaigns,
          totalLobbies,
          totalFollows,
          estimatedDemand: totalLobbies,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/brands/[slug]]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}
