import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/search
// ============================================================================
// Global search for campaigns and users
// Query params:
//   - q: search query (required)
//   - type: filter by type ('campaigns', 'users', 'all' - default 'all')
//   - limit: results per type (default 10, max 50)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''
    const type = searchParams.get('type') || 'all'
    const limitStr = searchParams.get('limit') || '10'
    const limit = Math.min(Math.max(1, parseInt(limitStr)), 50)

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json({
        campaigns: [],
        users: [],
        message: 'Query must be at least 2 characters',
      })
    }

    const results: {
      campaigns?: any[]
      users?: any[]
    } = {}

    // Search campaigns
    if (type === 'campaigns' || type === 'all') {
      const campaigns = await prisma.campaign.findMany({
        where: {
          status: 'LIVE',
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: true,
          status: true,
          creator: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              handle: true,
            },
          },
        },
        take: limit,
      })

      // Add lobby count for each campaign
      const campaignsWithCounts = await Promise.all(
        campaigns.map(async (campaign) => {
          const lobbyCount = await prisma.lobby.count({
            where: { campaignId: campaign.id },
          })
          return {
            ...campaign,
            lobbyCount,
          }
        })
      )

      results.campaigns = campaignsWithCounts
    }

    // Search users
    if (type === 'users' || type === 'all') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              displayName: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              handle: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatar: true,
          bio: true,
          contributionScore: true,
        },
        take: limit,
      })

      results.users = users
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
