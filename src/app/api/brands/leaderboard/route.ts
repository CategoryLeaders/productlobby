import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type SortType = 'most-responsive' | 'least-responsive'

// GET /api/brands/leaderboard - Brand responsiveness leaderboard
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sort = (searchParams.get('sort') || 'most-responsive') as SortType
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    let orderBy: any = { responsivenessScore: { sort: 'desc', nulls: 'last' } }
    if (sort === 'least-responsive') {
      orderBy = { responsivenessScore: { sort: 'asc', nulls: 'last' } }
    }

    const brands = await prisma.brand.findMany({
      where: {
        responsivenessScore: { not: null },
      },
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        responsivenessScore: true,
        _count: {
          select: { campaigns: true },
        },
      },
    })

    // Calculate response rate for each brand
    const brandsWithStats = await Promise.all(
      brands.map(async (brand: any) => {
        const totalCampaigns = await prisma.campaign.count({
          where: { targetedBrandId: brand.id },
        })

        const responseCampaigns = await prisma.campaign.count({
          where: {
            targetedBrandId: brand.id,
            brandResponses: {
              some: {},
            },
          },
        })

        const responseRate = totalCampaigns > 0 ? (responseCampaigns / totalCampaigns) * 100 : 0

        return {
          ...brand,
          totalCampaigns,
          responseRate: Math.round(responseRate),
        }
      })
    )

    return NextResponse.json({
      brands: brandsWithStats,
      total: brandsWithStats.length,
      sort,
    })
  } catch (error) {
    console.error('[GET /api/brands/leaderboard]', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
