/**
 * Privacy layer for brand-facing data.
 * Brands see AGGREGATE data only. Never individual PII.
 *
 * Core principle: Aggregate, anonymize, protect user privacy.
 * Brands should never see names, emails, user IDs, or individual profiles.
 */

import { prisma } from '@/lib/db'
import { calculatePercentile } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface AggregatedLobbyData {
  total: number
  byIntensity: {
    NEAT_IDEA: number
    PROBABLY_BUY: number
    TAKE_MY_MONEY: number
  }
  byRegion: Record<string, number>
  trend: { date: string; count: number }[]
  verifiedPercentage: number
}

export interface AggregatedPledgeData {
  totalSupport: number
  totalIntent: number
  medianPriceCeiling: number
  p25PriceCeiling: number
  p75PriceCeiling: number
  p90PriceCeiling: number
  byTimeframe: Record<string, number>
  intentTrend: { date: string; count: number }[]
}

export interface BrandSafeCampaignData {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  path: string
  currency: string
  createdAt: Date
  updatedAt: Date
  signalScore: number | null
  lobbies: AggregatedLobbyData
  pledges: AggregatedPledgeData
  revenueProjection: {
    estimatedTotal: number
    currency: string
  }
}

// ============================================================================
// PRIVACY HELPERS
// ============================================================================

/**
 * Get all lobbies for a campaign (unfiltered)
 */
async function getCampaignLobbies(campaignId: string) {
  return prisma.lobby.findMany({
    where: { campaignId },
    select: {
      id: true,
      intensity: true,
      status: true,
      createdAt: true,
    },
  })
}

/**
 * Get all pledges for a campaign (unfiltered)
 */
async function getCampaignPledges(campaignId: string) {
  return prisma.pledge.findMany({
    where: { campaignId },
    select: {
      id: true,
      pledgeType: true,
      priceCeiling: true,
      timeframeDays: true,
      region: true,
      createdAt: true,
    },
  })
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate lobby data into distribution metrics.
 * Returns counts and distributions, never individual lobbies.
 */
export function aggregateLobbies(lobbies: any[]): AggregatedLobbyData {
  // Count by intensity
  const byIntensity = {
    NEAT_IDEA: 0,
    PROBABLY_BUY: 0,
    TAKE_MY_MONEY: 0,
  }

  const byRegion: Record<string, number> = {}
  let verifiedCount = 0
  const dateMap = new Map<string, number>()

  for (const lobby of lobbies) {
    // Count intensity
    if (lobby.intensity in byIntensity) {
      byIntensity[lobby.intensity as keyof typeof byIntensity]++
    }

    // Count verified status
    if (lobby.status === 'VERIFIED') {
      verifiedCount++
    }

    // Aggregate by date (daily trend)
    const dateKey = new Date(lobby.createdAt).toISOString().split('T')[0]
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1)
  }

  // Convert date map to trend array, limit to last 30 days
  const trend = Array.from(dateMap.entries())
    .map(([date, count]: [string, number]) => ({ date, count }))
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
    .slice(-30)

  const total = lobbies.length
  const verifiedPercentage = total > 0 ? Math.round((verifiedCount / total) * 100) : 0

  return {
    total,
    byIntensity,
    byRegion,
    trend,
    verifiedPercentage,
  }
}

/**
 * Aggregate pledge data into price and intent metrics.
 * Returns totals and percentiles, never individual pledges.
 */
export function aggregatePledges(pledges: any[]): AggregatedPledgeData {
  const supportPledges = pledges.filter((p) => p.pledgeType === 'SUPPORT')
  const intentPledges = pledges.filter((p) => p.pledgeType === 'INTENT')

  // Extract price ceilings (filter out nulls and convert Decimal to number)
  const priceCeilings = pledges
    .filter((p: any) => p.priceCeiling !== null)
    .map((p: any) => {
      const val = p.priceCeiling
      return typeof val === 'object' ? parseFloat(val.toString()) : val
    })

  // Calculate percentiles
  const medianPriceCeiling =
    priceCeilings.length > 0 ? calculatePercentile(priceCeilings, 50) : 0
  const p25PriceCeiling =
    priceCeilings.length > 0 ? calculatePercentile(priceCeilings, 25) : 0
  const p75PriceCeiling =
    priceCeilings.length > 0 ? calculatePercentile(priceCeilings, 75) : 0
  const p90PriceCeiling =
    priceCeilings.length > 0 ? calculatePercentile(priceCeilings, 90) : 0

  // Aggregate by timeframe
  const byTimeframe: Record<string, number> = {
    '30d': 0,
    '90d': 0,
    '180d': 0,
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

  for (const pledge of intentPledges) {
    const createdAt = new Date(pledge.createdAt)
    if (createdAt > thirtyDaysAgo) byTimeframe['30d']++
    if (createdAt > ninetyDaysAgo) byTimeframe['90d']++
    if (createdAt > oneEightyDaysAgo) byTimeframe['180d']++
  }

  // Build intent trend (daily)
  const intentDateMap = new Map<string, number>()
  for (const pledge of intentPledges) {
    const dateKey = new Date(pledge.createdAt).toISOString().split('T')[0]
    intentDateMap.set(dateKey, (intentDateMap.get(dateKey) || 0) + 1)
  }

  const intentTrend = Array.from(intentDateMap.entries())
    .map(([date, count]: [string, number]) => ({ date, count }))
    .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))
    .slice(-30)

  return {
    totalSupport: supportPledges.length,
    totalIntent: intentPledges.length,
    medianPriceCeiling,
    p25PriceCeiling,
    p75PriceCeiling,
    p90PriceCeiling,
    byTimeframe,
    intentTrend,
  }
}

/**
 * Sanitize campaign data for brand consumption.
 * Removes all PII, returns aggregate metrics only.
 */
export async function sanitizeForBrand(campaign: any): Promise<BrandSafeCampaignData> {
  // Fetch aggregated data
  const lobbies = await getCampaignLobbies(campaign.id)
  const pledges = await getCampaignPledges(campaign.id)

  const aggregatedLobbies = aggregateLobbies(lobbies)
  const aggregatedPledges = aggregatePledges(pledges)

  // Calculate revenue projection based on intent pledges and price ceilings
  const intentPledgesWithPrice = pledges.filter(
    (p: any) => p.pledgeType === 'INTENT' && p.priceCeiling !== null
  )

  let revenueProjection = 0
  if (intentPledgesWithPrice.length > 0) {
    const avgPrice =
      intentPledgesWithPrice.reduce((sum: number, p: any) => {
        const val = p.priceCeiling
        const numVal = typeof val === 'object' ? parseFloat(val.toString()) : val
        return sum + numVal
      }, 0) / intentPledgesWithPrice.length

    revenueProjection = Math.round(intentPledgesWithPrice.length * avgPrice)
  }

  return {
    id: campaign.id,
    title: campaign.title,
    slug: campaign.slug,
    description: campaign.description,
    category: campaign.category,
    status: campaign.status,
    path: campaign.path,
    currency: campaign.currency,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    signalScore: campaign.signalScore,
    lobbies: aggregatedLobbies,
    pledges: aggregatedPledges,
    revenueProjection: {
      estimatedTotal: revenueProjection,
      currency: campaign.currency,
    },
  }
}

// ============================================================================
// BRAND AUTHORIZATION
// ============================================================================

/**
 * Check if a user has brand role for a specific brand.
 * Returns true if user is OWNER, ADMIN, or MEMBER of the brand.
 */
export async function isBrandUser(userId: string, brandId: string): Promise<boolean> {
  try {
    const teamMember = await prisma.brandTeam.findUnique({
      where: {
        brandId_userId: {
          brandId,
          userId,
        },
      },
    })

    return !!teamMember
  } catch {
    return false
  }
}

/**
 * Check if a user is a brand OWNER (highest privilege).
 */
export async function isBrandOwner(userId: string, brandId: string): Promise<boolean> {
  try {
    const teamMember = await prisma.brandTeam.findUnique({
      where: {
        brandId_userId: {
          brandId,
          userId,
        },
      },
    })

    return teamMember?.role === 'OWNER'
  } catch {
    return false
  }
}

/**
 * Get all campaigns where user has brand access.
 * Used to validate that a brand can only see campaigns for their brand.
 */
export async function getBrandAccessibleCampaigns(userId: string): Promise<string[]> {
  try {
    const brands = await prisma.brandTeam.findMany({
      where: { userId },
      select: { brandId: true },
    })

    const brandIds = brands.map((b: any) => b.brandId)

    const campaigns = await prisma.campaign.findMany({
      where: {
        targetedBrandId: {
          in: brandIds,
        },
      },
      select: { id: true },
    })

    return campaigns.map((c: any) => c.id)
  } catch {
    return []
  }
}
