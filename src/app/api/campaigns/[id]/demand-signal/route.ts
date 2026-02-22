import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, createdAt: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get all lobbies with timestamps and intensity
    const lobbies = await prisma.lobby.findMany({
      where: { campaignId },
      select: {
        createdAt: true,
        intensity: true,
      },
      orderBy: { createdAt: 'asc' },
    }) as Array<{ createdAt: Date; intensity: string }>

    const totalLobbies = lobbies.length

    // Calculate daily velocity (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Build daily counts for last 30 days
    const velocityData: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const count = lobbies.filter(
        (l: { createdAt: Date; intensity: string }) => new Date(l.createdAt) >= dayStart && new Date(l.createdAt) < dayEnd
      ).length

      velocityData.push({
        date: dayStart.toISOString().split('T')[0],
        count,
      })
    }

    // Calculate cumulative for chart
    let cumulative = lobbies.filter((l: { createdAt: Date; intensity: string }) => new Date(l.createdAt) < thirtyDaysAgo).length
    const cumulativeData = velocityData.map((d) => {
      cumulative += d.count
      return { date: d.date, count: d.count, cumulative }
    })

    // Trending calculation
    const lobbiesThisWeek = lobbies.filter(
      (l: { createdAt: Date; intensity: string }) => new Date(l.createdAt) >= sevenDaysAgo
    ).length
    const lobbiesLastWeek = lobbies.filter(
      (l: { createdAt: Date; intensity: string }) =>
        new Date(l.createdAt) >= fourteenDaysAgo &&
        new Date(l.createdAt) < sevenDaysAgo
    ).length

    const weekOverWeekGrowth =
      lobbiesLastWeek > 0
        ? ((lobbiesThisWeek - lobbiesLastWeek) / lobbiesLastWeek) * 100
        : lobbiesThisWeek > 0
        ? 100
        : 0

    const isTrending = totalLobbies >= 5 && weekOverWeekGrowth > 50

    // Price sensitivity
    const takeMyMoney = lobbies.filter(
      (l: { createdAt: Date; intensity: string }) => l.intensity === 'TAKE_MY_MONEY'
    ).length
    const probablyBuy = lobbies.filter(
      (l: { createdAt: Date; intensity: string }) => l.intensity === 'PROBABLY_BUY'
    ).length
    const neatIdea = lobbies.filter(
      (l: { createdAt: Date; intensity: string }) => l.intensity === 'NEAT_IDEA'
    ).length

    const buyerSignal = totalLobbies > 0
      ? Math.round(((takeMyMoney + probablyBuy) / totalLobbies) * 100)
      : 0

    // Trending badges
    const badges: { label: string; type: 'trending' | 'signal' | 'velocity' }[] = []
    if (isTrending) {
      badges.push({ label: 'Trending', type: 'trending' })
    }
    if (buyerSignal >= 70) {
      badges.push({ label: 'Strong buyer signal', type: 'signal' })
    }
    if (lobbiesThisWeek >= 3) {
      badges.push({ label: `${lobbiesThisWeek} new this week`, type: 'velocity' })
    }

    return NextResponse.json({
      totalLobbies,
      velocity: cumulativeData,
      trending: {
        isTrending,
        weekOverWeekGrowth: Math.round(weekOverWeekGrowth),
        lobbiesThisWeek,
        lobbiesLastWeek,
      },
      priceSensitivity: {
        takeMyMoney,
        probablyBuy,
        neatIdea,
        buyerSignal,
      },
      badges,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/demand-signal]', error)
    return NextResponse.json(
      { error: 'Failed to compute demand signal' },
      { status: 500 }
    )
  }
}
