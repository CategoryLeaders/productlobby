/**
 * Campaign Demand Signal API
 * GET /api/campaigns/[id]/demand-signal
 *
 * Returns per-campaign demand signal metrics including:
 * - Velocity: 30-day time-series of daily lobby counts
 * - Trending: Week-over-week growth metrics
 * - Price Sensitivity: Buyer intent distribution
 * - Badges: Dynamic badges based on performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface DemandSignalData {
  totalLobbies: number
  velocity: { date: string; count: number; cumulative: number }[]
  trending: {
    isTrending: boolean
    weekOverWeekGrowth: number
    lobbiesThisWeek: number
    lobbiesLastWeek: number
  }
  priceSensitivity: {
    takeMyMoney: number
    probablyBuy: number
    neatIdea: number
    buyerSignal: number
  }
  badges: { label: string; type: 'trending' | 'signal' | 'velocity' }[]
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params

    // Fetch the campaign with creator check
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        title: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - you do not own this campaign' },
        { status: 403 }
      )
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get total lobby count
    const totalLobbies = await prisma.lobby.count({
      where: { campaignId },
    })

    // Fetch all lobbies from last 30 days for velocity calculation
    const lobbiesLast30Days = await prisma.lobby.findMany({
      where: {
        campaignId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, intensity: true },
      orderBy: { createdAt: 'asc' },
    })

    // Generate velocity data: 30 days of daily counts
    const velocityData: { date: string; count: number; cumulative: number }[] = []
    let cumulativeCount = 0

    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dailyCount = lobbiesLast30Days.filter(
        l => l.createdAt >= dayStart && l.createdAt < dayEnd
      ).length

      cumulativeCount += dailyCount

      velocityData.push({
        date: dayStart.toISOString().split('T')[0], // YYYY-MM-DD format
        count: dailyCount,
        cumulative: cumulativeCount,
      })
    }

    // Get recent growth (this week vs last week)
    const lobbiesThisWeek = await prisma.lobby.count({
      where: {
        campaignId,
        createdAt: { gte: sevenDaysAgo },
      },
    })

    const lobbiesLastWeek = await prisma.lobby.count({
      where: {
        campaignId,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    })

    // Calculate week-over-week growth rate
    const weekOverWeekGrowth =
      lobbiesLastWeek > 0
        ? Math.round(((lobbiesThisWeek - lobbiesLastWeek) / lobbiesLastWeek) * 100)
        : lobbiesThisWeek > 0
          ? 100
          : 0

    // Get price sensitivity from lobby intensities
    const intensityCounts = {
      TAKE_MY_MONEY: 0,
      PROBABLY_BUY: 0,
      NEAT_IDEA: 0,
    }

    lobbiesLast30Days.forEach(lobby => {
      if (lobby.intensity === 'TAKE_MY_MONEY') {
        intensityCounts.TAKE_MY_MONEY++
      } else if (lobby.intensity === 'PROBABLY_BUY') {
        intensityCounts.PROBABLY_BUY++
      } else if (lobby.intensity === 'NEAT_IDEA') {
        intensityCounts.NEAT_IDEA++
      }
    })

    // Also count all lobbies for total baseline
    const allLobbiesForIntensity = await prisma.lobby.findMany({
      where: { campaignId },
      select: { intensity: true },
    })

    const totalForIntensity = allLobbiesForIntensity.length

    const takeMyMoneyCount = allLobbiesForIntensity.filter(
      l => l.intensity === 'TAKE_MY_MONEY'
    ).length
    const probablyBuyCount = allLobbiesForIntensity.filter(
      l => l.intensity === 'PROBABLY_BUY'
    ).length
    const neatIdeaCount = allLobbiesForIntensity.filter(l => l.intensity === 'NEAT_IDEA').length

    // Calculate buyer signal: percentage of "Take My Money" + "Probably Buy"
    const buyerSignal =
      totalForIntensity > 0
        ? Math.round(((takeMyMoneyCount + probablyBuyCount) / totalForIntensity) * 100)
        : 0

    // Generate badges based on metrics
    const badges: { label: string; type: 'trending' | 'signal' | 'velocity' }[] = []

    // Trending badge: if week-over-week growth > 10%
    if (weekOverWeekGrowth > 10) {
      badges.push({
        label: `+${weekOverWeekGrowth}% this week`,
        type: 'trending',
      })
    }

    // Signal badge: if buyer signal > 60%
    if (buyerSignal > 60) {
      badges.push({
        label: `${buyerSignal}% strong signal`,
        type: 'signal',
      })
    }

    // Velocity badge: if more than 5 new lobbies this week
    if (lobbiesThisWeek > 5) {
      badges.push({
        label: `${lobbiesThisWeek} new this week`,
        type: 'velocity',
      })
    }

    // Build response matching DemandSignalData interface
    const responseData: DemandSignalData = {
      totalLobbies,
      velocity: velocityData,
      trending: {
        isTrending: weekOverWeekGrowth > 10,
        weekOverWeekGrowth,
        lobbiesThisWeek,
        lobbiesLastWeek,
      },
      priceSensitivity: {
        takeMyMoney: takeMyMoneyCount,
        probablyBuy: probablyBuyCount,
        neatIdea: neatIdeaCount,
        buyerSignal,
      },
      badges,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Demand signal error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
