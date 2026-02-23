import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface UserStatsResponse {
  campaignsCreated: number
  totalLobbies: number
  commentsMade: number
  followers: number
  accountAge: number
}

/**
 * GET /api/users/[id]/stats
 * Returns stats for a specific user by ID
 * Counts: campaigns, lobbies, comments, followers
 * Calculates account age in days
 * Public endpoint (no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    // Validate user ID parameter
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Fetch user to verify existence and get creation date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get total campaigns created
    const campaignsCreated = await prisma.campaign.count({
      where: { creatorUserId: userId },
    })

    // Get total lobbies given
    const totalLobbies = await prisma.lobby.count({
      where: { userId },
    })

    // Get total comments made
    const commentsMade = await prisma.comment.count({
      where: { userId },
    })

    // Get followers count (users following this user's campaigns)
    const followers = await prisma.follow.count({
      where: {
        campaign: {
          creatorUserId: userId,
        },
      },
    })

    // Calculate account age in days
    const now = new Date()
    const creationDate = new Date(user.createdAt)
    const accountAge = Math.floor(
      (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const stats: UserStatsResponse = {
      campaignsCreated,
      totalLobbies,
      commentsMade,
      followers,
      accountAge,
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
