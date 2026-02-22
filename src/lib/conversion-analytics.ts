import { prisma } from '@/lib/db'

export interface FunnelData {
  visitors: number
  lobbyists: number
  pledgers: number
  orderers: number
}

export interface ConversionRates {
  visitToLobby: number
  lobbyToPledge: number
  pledgeToOrder: number
  overallConversion: number
}

export interface IntensityBreakdown {
  neatIdea: {
    count: number
    converted: number
    rate: number
  }
  probablyBuy: {
    count: number
    converted: number
    rate: number
  }
  takeMyMoney: {
    count: number
    converted: number
    rate: number
  }
}

export interface TrendData {
  date: string
  lobbies: number
  pledges: number
  orders: number
}

export interface BenchmarkData {
  industryAvg: number
  campaignPerformance: 'below' | 'average' | 'above' | 'exceptional'
}

export interface ConversionFunnelResult {
  funnel: FunnelData
  rates: ConversionRates
  byIntensity: IntensityBreakdown
  trends: TrendData[]
  benchmarks: BenchmarkData
}

export interface PlatformConversionStats {
  totalCampaigns: number
  activeCampaigns: number
  averageConversionRate: number
  totalVisitors: number
  totalLobbyists: number
  totalPledgers: number
  totalOrders: number
  topPerforming: Array<{
    campaignId: string
    campaignTitle: string
    conversionRate: number
  }>
}

/**
 * Calculate the conversion funnel for a specific campaign
 * Tracks: Visitors -> Lobbyists -> Pledgers -> Orderers
 */
export async function calculateConversionFunnel(
  campaignId: string
): Promise<ConversionFunnelResult> {
  try {
    // Get campaign and verify it exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: {
            lobbies: true,
            pledges: true,
            shares: true,
          },
        },
      },
    })

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`)
    }

    // Estimate visitors: shares count + lobbies (people who lobbied came from somewhere)
    const shareClicks = await prisma.share.aggregate({
      where: { campaignId },
      _sum: { clickCount: true },
    })
    const shareVisitors = shareClicks._sum.clickCount || 0
    const lobbyCount = campaign._count.lobbies

    // Direct visitors estimate: if people lobbied without a tracked share, assume some traffic
    const estimatedDirectVisitors = Math.max(lobbyCount, Math.ceil(lobbyCount * 0.5))
    const visitors = Math.max(shareVisitors + estimatedDirectVisitors, lobbyCount)

    // Count lobbyists by intensity
    const lobbiesByIntensity = await prisma.lobby.groupBy({
      by: ['intensity'],
      where: { campaignId },
      _count: true,
    })

    const intensityMap = new Map<string, number>()
    lobbiesByIntensity.forEach((item) => {
      intensityMap.set(item.intensity, item._count)
    })

    const neatIdeaCount = intensityMap.get('NEAT_IDEA') || 0
    const probablyBuyCount = intensityMap.get('PROBABLY_BUY') || 0
    const takeMyMoneyCount = intensityMap.get('TAKE_MY_MONEY') || 0
    const lobbyists = neatIdeaCount + probablyBuyCount + takeMyMoneyCount

    // Count unique pledgers per intensity
    const pledgesByIntensity = await prisma.pledge.findMany({
      where: { campaignId },
      include: {
        user: {
          include: {
            lobbies: {
              where: { campaignId },
            },
          },
        },
      },
    })

    const intensityToPledgers = new Map<string, Set<string>>()
    intensityToPledgers.set('NEAT_IDEA', new Set())
    intensityToPledgers.set('PROBABLY_BUY', new Set())
    intensityToPledgers.set('TAKE_MY_MONEY', new Set())

    pledgesByIntensity.forEach((pledge) => {
      const lobbyIntensity = pledge.user.lobbies[0]?.intensity || 'NEAT_IDEA'
      const set = intensityToPledgers.get(lobbyIntensity) || new Set()
      set.add(pledge.userId)
      intensityToPledgers.set(lobbyIntensity, set)
    })

    const pledgers = pledgesByIntensity.length > 0
      ? new Set(pledgesByIntensity.map((p) => p.userId)).size
      : 0

    // Count orderers by intensity
    const offers = await prisma.offer.findMany({
      where: { campaignId },
      include: {
        orders: {
          include: {
            user: {
              include: {
                lobbies: {
                  where: { campaignId },
                },
              },
            },
          },
        },
      },
    })

    const intensityToOrderers = new Map<string, Set<string>>()
    intensityToOrderers.set('NEAT_IDEA', new Set())
    intensityToOrderers.set('PROBABLY_BUY', new Set())
    intensityToOrderers.set('TAKE_MY_MONEY', new Set())

    offers.forEach((offer) => {
      offer.orders.forEach((order) => {
        const lobbyIntensity = order.user.lobbies[0]?.intensity || 'NEAT_IDEA'
        const set = intensityToOrderers.get(lobbyIntensity) || new Set()
        set.add(order.userId)
        intensityToOrderers.set(lobbyIntensity, set)
      })
    })

    const orderers = offers.length > 0
      ? Array.from(intensityToOrderers.values()).reduce(
          (acc, set) => acc + set.size,
          0
        )
      : 0

    // Calculate funnel
    const funnel: FunnelData = {
      visitors,
      lobbyists,
      pledgers,
      orderers,
    }

    // Calculate conversion rates
    const visitToLobby = visitors > 0 ? (lobbyists / visitors) * 100 : 0
    const lobbyToPledge = lobbyists > 0 ? (pledgers / lobbyists) * 100 : 0
    const pledgeToOrder = pledgers > 0 ? (orderers / pledgers) * 100 : 0
    const overallConversion = visitors > 0 ? (orderers / visitors) * 100 : 0

    const rates: ConversionRates = {
      visitToLobby,
      lobbyToPledge,
      pledgeToOrder,
      overallConversion,
    }

    // Build intensity breakdown
    const byIntensity: IntensityBreakdown = {
      neatIdea: {
        count: neatIdeaCount,
        converted: intensityToOrderers.get('NEAT_IDEA')?.size || 0,
        rate: neatIdeaCount > 0
          ? ((intensityToOrderers.get('NEAT_IDEA')?.size || 0) / neatIdeaCount) * 100
          : 0,
      },
      probablyBuy: {
        count: probablyBuyCount,
        converted: intensityToOrderers.get('PROBABLY_BUY')?.size || 0,
        rate: probablyBuyCount > 0
          ? ((intensityToOrderers.get('PROBABLY_BUY')?.size || 0) / probablyBuyCount) * 100
          : 0,
      },
      takeMyMoney: {
        count: takeMyMoneyCount,
        converted: intensityToOrderers.get('TAKE_MY_MONEY')?.size || 0,
        rate: takeMyMoneyCount > 0
          ? ((intensityToOrderers.get('TAKE_MY_MONEY')?.size || 0) / takeMyMoneyCount) * 100
          : 0,
      },
    }

    // Get 30-day trends
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyLobbies = await prisma.lobby.groupBy({
      by: ['createdAt'],
      where: {
        campaignId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { createdAt: 'asc' },
    })

    const dailyPledges = await prisma.pledge.groupBy({
      by: ['createdAt'],
      where: {
        campaignId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { createdAt: 'asc' },
    })

    const dailyOrders = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { createdAt: 'asc' },
    })

    // Create a map for aggregated daily data
    const dailyMap = new Map<string, TrendData>()

    dailyLobbies.forEach((item) => {
      const date = (item.createdAt as Date).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || {
        date,
        lobbies: 0,
        pledges: 0,
        orders: 0,
      }
      existing.lobbies = item._count
      dailyMap.set(date, existing)
    })

    dailyPledges.forEach((item) => {
      const date = (item.createdAt as Date).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || {
        date,
        lobbies: 0,
        pledges: 0,
        orders: 0,
      }
      existing.pledges = item._count
      dailyMap.set(date, existing)
    })

    dailyOrders.forEach((item) => {
      const date = (item.createdAt as Date).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || {
        date,
        lobbies: 0,
        pledges: 0,
        orders: 0,
      }
      existing.orders = item._count
      dailyMap.set(date, existing)
    })

    const trends = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate benchmarks
    const industryAvg = 3.5 // Typical crowdfunding conversion is 3-5%
    const campaignPerf =
      overallConversion < 2
        ? 'below'
        : overallConversion < 3.5
        ? 'average'
        : overallConversion < 6
        ? 'above'
        : 'exceptional'

    const benchmarks: BenchmarkData = {
      industryAvg,
      campaignPerformance: campaignPerf,
    }

    return {
      funnel,
      rates,
      byIntensity,
      trends,
      benchmarks,
    }
  } catch (error) {
    console.error('Error calculating conversion funnel:', error)
    throw error
  }
}

/**
 * Calculate platform-wide conversion analytics
 */
export async function calculatePlatformConversions(): Promise<PlatformConversionStats> {
  try {
    const allCampaigns = await prisma.campaign.findMany({
      where: { status: 'LIVE' },
      include: {
        _count: {
          select: {
            lobbies: true,
            pledges: true,
            offers: true,
          },
        },
      },
    })

    const activeCampaigns = allCampaigns.filter((c) => c._count.lobbies > 0 || c._count.pledges > 0)

    // Count total across all campaigns
    const totalLobbies = await prisma.lobby.count()
    const totalPledges = await prisma.pledge.count()
    const totalOrders = await prisma.order.count()
    const totalShares = await prisma.share.aggregate({
      _sum: { clickCount: true },
    })

    const totalVisitors = Math.max(
      (totalShares._sum.clickCount || 0) + totalLobbies,
      totalLobbies
    )
    const avgConversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0

    // Get top performing campaigns
    const topPerforming = await Promise.all(
      allCampaigns
        .slice(0, 5)
        .map(async (campaign) => {
          const stats = await calculateConversionFunnel(campaign.id)
          return {
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            conversionRate: stats.rates.overallConversion,
          }
        })
    )

    topPerforming.sort((a, b) => b.conversionRate - a.conversionRate)

    return {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: activeCampaigns.length,
      averageConversionRate: avgConversionRate,
      totalVisitors,
      totalLobbyists: totalLobbies,
      totalPledgers: totalPledges,
      totalOrders,
      topPerforming,
    }
  } catch (error) {
    console.error('Error calculating platform conversions:', error)
    throw error
  }
}
