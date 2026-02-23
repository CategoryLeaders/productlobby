import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// TYPES
// ============================================================================

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    avatar: string | null
    displayName: string
    handle: string | null
  }
  score: number
  badgeLevel: string
}

interface LeaderboardResponse {
  success: boolean
  data: LeaderboardEntry[]
  currentUserRank?: number & {
    rank: number
    score: number
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateBadgeLevel(score: number): string {
  if (score >= 1000) return 'Legendary'
  if (score >= 500) return 'Champion'
  if (score >= 250) return 'Hero'
  if (score >= 100) return 'Rising Star'
  if (score >= 50) return 'Contributor'
  return 'Supporter'
}

// ============================================================================
// GET /api/leaderboard
// ============================================================================
// Returns leaderboard data with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'supporters' // supporters, creators, or all
    const period = searchParams.get('period') || 'all' // week, month, or all
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    const currentUser = await getCurrentUser()

    // Calculate date range based on period
    let dateFrom: Date | null = null
    if (period === 'week') {
      dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // Fetch data based on type
    let leaderboardData: LeaderboardEntry[] = []

    if (type === 'supporters' || type === 'all') {
      // Rank supporters by total contribution points
      const contributions = await prisma.contributionEvent.groupBy({
        by: ['userId'],
        _sum: {
          points: true,
        },
        where: dateFrom ? { createdAt: { gte: dateFrom } } : undefined,
        orderBy: {
          _sum: {
            points: 'desc',
          },
        },
        take: limit,
      })

      const supportersData = await Promise.all(
        contributions.map(async (contribution, index) => {
          const user = await prisma.user.findUnique({
            where: { id: contribution.userId },
            select: {
              id: true,
              avatar: true,
              displayName: true,
              handle: true,
            },
          })

          if (!user) return null

          const score = contribution._sum.points || 0
          return {
            rank: index + 1,
            user,
            score,
            badgeLevel: calculateBadgeLevel(score),
          }
        })
      )

      leaderboardData = supportersData.filter((item) => item !== null) as LeaderboardEntry[]
    } else if (type === 'creators' || type === 'all') {
      // Rank creators by total lobbies across their campaigns
      const creators = await prisma.user.findMany({
        select: {
          id: true,
          avatar: true,
          displayName: true,
          handle: true,
          campaigns: {
            select: {
              _count: {
                select: {
                  lobbies: true,
                },
              },
            },
          },
        },
        orderBy: {
          campaigns: {
            _count: 'desc',
          },
        },
        take: limit,
      })

      leaderboardData = creators
        .map((creator, index) => {
          const totalLobbies = creator.campaigns.reduce((sum, campaign) => {
            return sum + (campaign._count.lobbies || 0)
          }, 0)

          return {
            rank: index + 1,
            user: {
              id: creator.id,
              avatar: creator.avatar,
              displayName: creator.displayName,
              handle: creator.handle,
            },
            score: totalLobbies,
            badgeLevel: calculateBadgeLevel(totalLobbies),
          }
        })
        .filter((entry) => entry.score > 0)
    }

    // Find current user's rank if authenticated
    let currentUserRank: (typeof leaderboardData[0] & { rank: number; score: number }) | undefined

    if (currentUser) {
      const userEntry = leaderboardData.find((entry) => entry.user.id === currentUser.id)
      if (userEntry) {
        currentUserRank = userEntry as any
      }
    }

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      currentUserRank,
    } as LeaderboardResponse)
  } catch (error) {
    console.error('[GET /api/leaderboard]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}
