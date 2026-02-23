import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/search/suggestions
// ============================================================================
// Fast autocomplete suggestions for search dropdown
// Query params:
//   - q: search query (required)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim() || ''

    // Validate query
    if (!query || query.length < 1) {
      return NextResponse.json({
        campaigns: [],
        users: [],
      })
    }

    const [campaigns, users] = await Promise.all([
      // Get campaign suggestions (max 5)
      prisma.campaign.findMany({
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
        },
        take: 5,
      }),

      // Get user suggestions (max 3)
      prisma.user.findMany({
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
        },
        take: 3,
      }),
    ])

    return NextResponse.json({
      campaigns,
      users,
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Suggestions failed' },
      { status: 500 }
    )
  }
}
