import { prisma } from './db'
import { calculatePercentile, clamp } from './utils'

interface SignalScoreInputs {
  supportCount: number
  intentCount: number
  intentPhoneVerifiedCount: number
  medianPriceCeiling: number
  p90PriceCeiling: number
  intentLast7Days: number
  intentPrev7Days: number
  fraudRiskScore: number
  // Lobby intensity breakdown
  neatIdeaCount: number
  probablyBuyCount: number
  takeMyMoneyCount: number
  // Campaign completeness (0-100)
  completenessScore: number
}

interface SignalScoreResult {
  score: number
  inputs: SignalScoreInputs
  demandValue: number
  momentum: number
  lobbyConviction: number
  tier: 'low' | 'medium' | 'high' | 'very_high'
  // Revenue projection for brands
  projectedRevenue: number
  projectedCustomers: number
}

// Calculate Signal Score for a campaign
export async function calculateSignalScore(campaignId: string): Promise<SignalScoreResult> {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Fetch pledge data
  const pledges = await prisma.pledge.findMany({
    where: { campaignId },
    include: {
      user: {
        select: { phoneVerified: true },
      },
    },
  })

  // Fetch lobby data (intensity breakdown)
  const lobbies = await prisma.lobby.findMany({
    where: { campaignId, status: 'VERIFIED' },
    select: { intensity: true },
  })

  // Fetch campaign completeness
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { completenessScore: true },
  })

  // Lobby intensity counts
  const neatIdeaCount = lobbies.filter((l: typeof lobbies[0]) => l.intensity === 'NEAT_IDEA').length
  const probablyBuyCount = lobbies.filter((l: typeof lobbies[0]) => l.intensity === 'PROBABLY_BUY').length
  const takeMyMoneyCount = lobbies.filter((l: typeof lobbies[0]) => l.intensity === 'TAKE_MY_MONEY').length

  // Support pledges
  const supportPledges = pledges.filter((p: typeof pledges[0]) => p.pledgeType === 'SUPPORT')
  const supportCount = supportPledges.length

  // Intent pledges
  const intentPledges = pledges.filter((p: typeof pledges[0]) => p.pledgeType === 'INTENT')
  const intentCount = intentPledges.length
  const intentPhoneVerifiedCount = intentPledges.filter((p: typeof pledges[0]) => p.user.phoneVerified).length

  // Price ceilings
  const priceCeilings = intentPledges
    .map((p: typeof pledges[0]) => p.priceCeiling)
    .filter((p: any): p is NonNullable<typeof p> => p !== null)
    .map((p: any) => Number(p))

  const medianPriceCeiling = priceCeilings.length > 0
    ? calculatePercentile(priceCeilings, 50)
    : 0
  const p90PriceCeiling = priceCeilings.length > 0
    ? calculatePercentile(priceCeilings, 90)
    : 0

  // Momentum: intent pledges in last 7 days vs previous 7 days
  const intentLast7Days = intentPledges.filter(
    (p: typeof pledges[0]) => p.createdAt >= sevenDaysAgo
  ).length
  const intentPrev7Days = intentPledges.filter(
    (p: typeof pledges[0]) => p.createdAt >= fourteenDaysAgo && p.createdAt < sevenDaysAgo
  ).length

  // Fraud risk (placeholder - would integrate with fraud detection service)
  const fraudRiskScore = 0

  const inputs: SignalScoreInputs = {
    supportCount,
    intentCount,
    intentPhoneVerifiedCount,
    medianPriceCeiling,
    p90PriceCeiling,
    intentLast7Days,
    intentPrev7Days,
    fraudRiskScore,
    neatIdeaCount,
    probablyBuyCount,
    takeMyMoneyCount,
    completenessScore: campaign?.completenessScore ?? 0,
  }

  return computeSignalScore(inputs)
}

// Lobby intensity weights — "Take My Money" is 5x stronger signal than "Neat Idea"
const INTENSITY_WEIGHTS = {
  NEAT_IDEA: 1,
  PROBABLY_BUY: 3,
  TAKE_MY_MONEY: 5,
} as const

// Assumed conversion rates by intensity tier (for brand revenue projections)
const CONVERSION_RATES = {
  NEAT_IDEA: 0.05,       // 5% — browser, low commitment
  PROBABLY_BUY: 0.25,    // 25% — likely to convert
  TAKE_MY_MONEY: 0.65,   // 65% — strong buying signal
} as const

// Pure computation function (can be used for testing/simulation)
export function computeSignalScore(inputs: SignalScoreInputs): SignalScoreResult {
  const {
    supportCount,
    intentCount,
    intentPhoneVerifiedCount,
    medianPriceCeiling,
    intentLast7Days,
    intentPrev7Days,
    fraudRiskScore,
    neatIdeaCount,
    probablyBuyCount,
    takeMyMoneyCount,
    completenessScore,
  } = inputs

  // Weighted intent (phone verified adds weight)
  const weightedIntent = intentCount + 0.2 * intentPhoneVerifiedCount

  // Lobby conviction score — weighted by intensity
  // Ranges 0-5 (average weight across all lobbies)
  const totalLobbies = neatIdeaCount + probablyBuyCount + takeMyMoneyCount
  const lobbyConviction = totalLobbies > 0
    ? (neatIdeaCount * INTENSITY_WEIGHTS.NEAT_IDEA +
       probablyBuyCount * INTENSITY_WEIGHTS.PROBABLY_BUY +
       takeMyMoneyCount * INTENSITY_WEIGHTS.TAKE_MY_MONEY) / totalLobbies
    : 0

  // Demand value estimate
  const demandValue = weightedIntent * medianPriceCeiling

  // Momentum (1 = flat, 2 = fast growth, capped)
  const momentum = clamp(
    intentLast7Days / Math.max(1, intentPrev7Days),
    0,
    2
  )

  // Completeness bonus — well-specified campaigns signal higher quality
  // Ranges 0-1 (normalised from 0-100 score)
  const completenessMultiplier = 1 + (completenessScore / 100) * 0.3

  // Score formula — now includes lobby conviction and completeness
  const scoreRaw = (
    18 * Math.log10(1 + demandValue) +          // Revenue potential (largest weight)
    8 * Math.log10(1 + weightedIntent) +         // Raw intent volume
    3 * Math.log10(1 + supportCount) +           // Community support
    5 * Math.log10(1 + totalLobbies) +           // Total lobby reach
    4 * lobbyConviction +                        // Quality of buying signals
    6 * momentum -                               // Growth trajectory
    20 * fraudRiskScore                          // Fraud penalty
  ) * completenessMultiplier

  const score = clamp(Math.round(scoreRaw * 10) / 10, 0, 100)

  // Revenue projection for brands
  // "If we build this, how much revenue could we expect?"
  const projectedCustomers = Math.round(
    neatIdeaCount * CONVERSION_RATES.NEAT_IDEA +
    probablyBuyCount * CONVERSION_RATES.PROBABLY_BUY +
    takeMyMoneyCount * CONVERSION_RATES.TAKE_MY_MONEY +
    intentCount * 0.4 // Intent pledges at ~40% conversion
  )
  const projectedRevenue = Math.round(projectedCustomers * medianPriceCeiling)

  // Determine tier
  let tier: 'low' | 'medium' | 'high' | 'very_high'
  if (score >= 80) tier = 'very_high'
  else if (score >= 55) tier = 'high'
  else if (score >= 35) tier = 'medium'
  else tier = 'low'

  return {
    score,
    inputs,
    demandValue,
    momentum,
    lobbyConviction,
    tier,
    projectedRevenue,
    projectedCustomers,
  }
}

export { INTENSITY_WEIGHTS, CONVERSION_RATES }

// Get score thresholds
export const SIGNAL_THRESHOLDS = {
  TRENDING: 35,
  NOTIFY_BRAND: 55,
  HIGH_SIGNAL: 70,
  SUGGEST_OFFER: 80,
} as const

// Update cached signal score for a campaign
export async function updateCachedSignalScore(campaignId: string): Promise<number> {
  const result = await calculateSignalScore(campaignId)

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      signalScore: result.score,
      signalScoreUpdatedAt: new Date(),
    },
  })

  return result.score
}

// Batch update signal scores for campaigns that need refresh
export async function refreshStaleSignalScores(staleMinutes: number = 5): Promise<void> {
  const staleThreshold = new Date(Date.now() - staleMinutes * 60 * 1000)

  const staleCampaigns = await prisma.campaign.findMany({
    where: {
      status: 'LIVE',
      OR: [
        { signalScoreUpdatedAt: null },
        { signalScoreUpdatedAt: { lt: staleThreshold } },
      ],
    },
    select: { id: true },
    take: 100, // Process in batches
  })

  for (const campaign of staleCampaigns) {
    await updateCachedSignalScore(campaign.id)
  }
}

// Get campaigns by signal tier
export async function getCampaignsBySignalTier(
  tier: 'low' | 'medium' | 'high' | 'very_high',
  limit: number = 20
) {
  const thresholds = {
    low: { min: 0, max: SIGNAL_THRESHOLDS.TRENDING },
    medium: { min: SIGNAL_THRESHOLDS.TRENDING, max: SIGNAL_THRESHOLDS.NOTIFY_BRAND },
    high: { min: SIGNAL_THRESHOLDS.NOTIFY_BRAND, max: SIGNAL_THRESHOLDS.HIGH_SIGNAL },
    very_high: { min: SIGNAL_THRESHOLDS.HIGH_SIGNAL, max: 101 },
  }

  const { min, max } = thresholds[tier]

  return prisma.campaign.findMany({
    where: {
      status: 'LIVE',
      signalScore: {
        gte: min,
        lt: max,
      },
    },
    orderBy: { signalScore: 'desc' },
    take: limit,
  })
}
