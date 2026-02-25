import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export interface UserStats {
  totalCampaignsCreated: number
  totalLobbiesGiven: number
  totalComments: number
  followers: number
  following: number
  impactScore: number
}

/**
 * Calculate impact score based on user contributions
 * Impact Score = (campaigns * 30%) + (lobbies * 40%) + (comments * 15%) + (followers * 15%)
 * Normalized to 0-100 scale
 */
function calculateImpactScore(
  campaigns: number,
  lobbies: number,
  comments: number,
  followers: number
): number {
  // Normalize each metric to 0-100 based on reasonable maximums
  // These thresholds represent what we consider "excellent" in each category
  const campaignMax = 50 // 50+ campaigns is excellent
  const lobbyMax = 500 // 500+ lobbies is excellent
  const commentMax = 1000 // 1000+ comments is excellent
  const followerMax = 10000 // 10k+ followers is excellent

  const campaignScore = Math.min((campaigns / campaignMax) * 100, 100)
  const lobbyScore = Math.min((lobbies / lobbyMax) * 100, 100)
  const commentScore = Math.min((comments / commentMax) * 100, 100)
  const followerScore = Math.min((followers / followerMax) * 100, 100)

  // Calculate weighted impact score
  const impactScore =
    campaignScore * 0.3 +
    lobbyScore * 0.4 +
    commentScore * 0.15 +
    followerScore * 0.15

  return Math.round(impactScore)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse> {
  try {
    const { handle } = await params

    // Validate handle parameter
    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Invalid handle parameter' },
        { status: 400 }
      )
    }

    // Fetch user by handle or ID (supports both lookups)
    let user = await prisma.user.findUnique({
      where: { handle },
      select: { id: true },
    })

    // If not found by handle, try by ID (for backward compatibility)
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: handle },
        select: { id: true },
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get total campaigns created
    const totalCampaignsCreated = await prisma.campaign.count({
      where: { creatorUserId: user.id },
    })

    // Get total lobbies given
    const totalLobbiesGiven = await prisma.lobby.count({
      where: { userId: user.id },
    })

    // Get total comments
    const totalComments = await prisma.comment.count({
      where: { userId: user.id },
    })

    // Get followers (users following this user's campaigns)
    const followers = await prisma.follow.count({
      where: {
        campaign: {
          creatorUserId: user.id,
        },
      },
    })

    // Get following (campaigns this user follows)
    const following = await prisma.follow.count({
      where: { userId: user.id },
    })

    // Calculate impact score
    const impactScore = calculateImpactScore(
      totalCampaignsCreated,
      totalLobbiesGiven,
      totalComments,
      followers
    )

    const stats: UserStats = {
      totalCampaignsCreated,
      totalLobbiesGiven,
      totalComments,
      followers,
      following,
      impactScore,
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
