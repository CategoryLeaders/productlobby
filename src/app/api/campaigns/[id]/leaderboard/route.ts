import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all'

    // Validate campaign exists
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId },
        ],
      },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate date filter based on period
    const now = new Date()
    let dateFilter: any = undefined

    if (period === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { gte: sevenDaysAgo }
    } else if (period === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { gte: thirtyDaysAgo }
    }
    // For 'all' period, dateFilter remains undefined (no date restriction)

    // Aggregate contribution events by user
    const leaderboard = await prisma.contributionEvent.groupBy({
      by: ['userId'],
      where: {
        campaignId: campaign.id,
        ...(dateFilter && { createdAt: dateFilter }),
      },
      _sum: {
        points: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
      take: 20,
    })

    // Fetch user details for top supporters
    const userIds = leaderboard.map((entry) => entry.userId)
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatar: true,
      },
    })

    // Create a map for quick lookup
    const userMap = new Map(users.map((user) => [user.id, user]))

    // Build response with ranked data
    const rankedLeaderboard = leaderboard.map((entry, index) => {
      const user = userMap.get(entry.userId)
      return {
        rank: index + 1,
        userId: entry.userId,
        displayName: user?.displayName || 'Unknown User',
        handle: user?.handle || null,
        avatar: user?.avatar || null,
        totalPoints: entry._sum.points || 0,
        eventCount: entry._count.id,
      }
    })

    return NextResponse.json({
      period,
      campaignId: campaign.id,
      leaderboard: rankedLeaderboard,
      total: rankedLeaderboard.length,
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
