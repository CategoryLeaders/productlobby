import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Get campaigns grouped by region
 * GET /api/campaigns/by-region
 *
 * Returns campaigns grouped by their region, with counts and top campaigns per region
 */
export async function GET(request: NextRequest) {
  try {
    // Get all active campaigns with their lobby data
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'LIVE' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        signalScore: true,
        createdAt: true,
        lobbies: {
          select: {
            id: true,
            intensity: true,
            createdAt: true,
          },
        },
        pledges: {
          select: {
            region: true,
            id: true,
          },
        },
      },
    })

    // Group campaigns by region
    const regionMap = new Map<
      string,
      {
        region: string
        campaignCount: number
        totalLobbies: number
        campaigns: Array<{
          id: string
          title: string
          slug: string
          category: string
          signalScore: number | null
          lobbyCount: number
        }>
      }
    >()

    campaigns.forEach((campaign) => {
      // Get regions from pledges
      const regions = new Set<string>()

      campaign.pledges.forEach((pledge) => {
        if (pledge.region) {
          regions.add(pledge.region)
        }
      })

      // If no region from pledges, use a default
      if (regions.size === 0) {
        regions.add('Global')
      }

      regions.forEach((region) => {
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            campaignCount: 0,
            totalLobbies: 0,
            campaigns: [],
          })
        }

        const regionData = regionMap.get(region)!
        const lobbyCount = campaign.lobbies.length

        regionData.campaignCount += 1
        regionData.totalLobbies += lobbyCount
        regionData.campaigns.push({
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          category: campaign.category,
          signalScore: campaign.signalScore,
          lobbyCount,
        })
      })
    })

    // Sort campaigns by signal score within each region
    const regions = Array.from(regionMap.values()).map((region) => ({
      ...region,
      campaigns: region.campaigns
        .sort((a, b) => (b.signalScore || 0) - (a.signalScore || 0))
        .slice(0, 5), // Top 5 campaigns per region
    }))

    // Sort regions by total lobbies (popularity)
    regions.sort((a, b) => b.totalLobbies - a.totalLobbies)

    return NextResponse.json({
      success: true,
      data: {
        regions,
        total: regions.length,
      },
    })
  } catch (error) {
    console.error('Get campaigns by region error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
