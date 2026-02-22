import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export interface PricingBracket {
  bracket: string
  count: number
  percentage: number
}

export interface SuggestedPricePoints {
  economy: number
  standard: number
  premium: number
}

export interface IntensityPricing {
  neatIdea: { avg: number; count: number }
  probablyBuy: { avg: number; count: number }
  takeMyMoney: { avg: number; count: number }
}

export interface DemandPoint {
  price: number
  estimatedBuyers: number
}

export interface PricingAnalysis {
  totalResponses: number
  averagePrice: number
  medianPrice: number
  modePrice: number
  priceRange: { min: number; max: number }
  distribution: PricingBracket[]
  suggestedPricePoints: SuggestedPricePoints
  byIntensity: IntensityPricing
  demandCurve: DemandPoint[]
  optimalPrice: number
  maxRevenue: number
}

function toNumber(value: Decimal | null | undefined): number {
  if (!value) return 0
  if (typeof value === 'number') return value
  return parseFloat(value.toString())
}

function getBracketLabel(min: number, max?: number): string {
  const currency = '£'
  if (!max) return `${currency}${min}+`
  return `${currency}${min}-${max}`
}

function getPriceBrackets(): Array<{ min: number; max?: number }> {
  return [
    { min: 0, max: 10 },
    { min: 10, max: 25 },
    { min: 25, max: 50 },
    { min: 50, max: 100 },
    { min: 100, max: 250 },
    { min: 250 },
  ]
}

function getPriceBracket(price: number): string {
  const brackets = getPriceBrackets()
  for (const bracket of brackets) {
    if (bracket.max !== undefined) {
      if (price >= bracket.min && price < bracket.max) {
        return getBracketLabel(bracket.min, bracket.max)
      }
    } else {
      if (price >= bracket.min) {
        return getBracketLabel(bracket.min)
      }
    }
  }
  return '£0-10'
}

export async function analyzePricing(
  campaignId: string
): Promise<PricingAnalysis> {
  try {
    // Get all pledges with price ceilings for this campaign
    const pledges = await prisma.pledge.findMany({
      where: {
        campaignId,
        priceCeiling: {
          not: null,
        },
      },
      include: {
        user: {
          include: {
            lobbies: {
              where: { campaignId },
              select: { intensity: true },
            },
          },
        },
      },
    })

    if (pledges.length === 0) {
      return {
        totalResponses: 0,
        averagePrice: 0,
        medianPrice: 0,
        modePrice: 0,
        priceRange: { min: 0, max: 0 },
        distribution: getPriceBrackets().map((b) => ({
          bracket: getBracketLabel(b.min, b.max),
          count: 0,
          percentage: 0,
        })),
        suggestedPricePoints: {
          economy: 0,
          standard: 0,
          premium: 0,
        },
        byIntensity: {
          neatIdea: { avg: 0, count: 0 },
          probablyBuy: { avg: 0, count: 0 },
          takeMyMoney: { avg: 0, count: 0 },
        },
        demandCurve: [],
        optimalPrice: 0,
        maxRevenue: 0,
      }
    }

    // Convert all prices to numbers
    const prices = pledges
      .map((p) => toNumber(p.priceCeiling))
      .filter((p) => p > 0)

    if (prices.length === 0) {
      return {
        totalResponses: pledges.length,
        averagePrice: 0,
        medianPrice: 0,
        modePrice: 0,
        priceRange: { min: 0, max: 0 },
        distribution: getPriceBrackets().map((b) => ({
          bracket: getBracketLabel(b.min, b.max),
          count: 0,
          percentage: 0,
        })),
        suggestedPricePoints: {
          economy: 0,
          standard: 0,
          premium: 0,
        },
        byIntensity: {
          neatIdea: { avg: 0, count: 0 },
          probablyBuy: { avg: 0, count: 0 },
          takeMyMoney: { avg: 0, count: 0 },
        },
        demandCurve: [],
        optimalPrice: 0,
        maxRevenue: 0,
      }
    }

    // Calculate statistics
    const sortedPrices = [...prices].sort((a, b) => a - b)
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const medianPrice =
      sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] +
            sortedPrices[sortedPrices.length / 2]) /
          2
        : sortedPrices[Math.floor(sortedPrices.length / 2)]

    // Calculate mode (most frequent price)
    const priceFrequency: Record<number, number> = {}
    prices.forEach((p) => {
      priceFrequency[p] = (priceFrequency[p] || 0) + 1
    })
    const modePrice = Object.entries(priceFrequency).sort(
      (a, b) => b[1] - a[1]
    )[0][0]

    // Price range
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    // Distribution by bracket
    const brackets = getPriceBrackets()
    const distribution: PricingBracket[] = brackets.map((bracket) => {
      let count = 0
      if (bracket.max !== undefined) {
        count = prices.filter(
          (p) => p >= bracket.min && p < bracket.max!
        ).length
      } else {
        count = prices.filter((p) => p >= bracket.min).length
      }
      return {
        bracket: getBracketLabel(bracket.min, bracket.max),
        count,
        percentage: Math.round((count / prices.length) * 100),
      }
    })

    // Calculate percentiles for suggested price points
    const q25Index = Math.floor(sortedPrices.length * 0.25)
    const q50Index = Math.floor(sortedPrices.length * 0.5)
    const q75Index = Math.floor(sortedPrices.length * 0.75)

    const suggestedPricePoints: SuggestedPricePoints = {
      economy: Math.round(sortedPrices[q25Index] * 100) / 100,
      standard: Math.round(sortedPrices[q50Index] * 100) / 100,
      premium: Math.round(sortedPrices[q75Index] * 100) / 100,
    }

    // By intensity breakdown
    const intensityPrices: Record<string, number[]> = {
      NEAT_IDEA: [],
      PROBABLY_BUY: [],
      TAKE_MY_MONEY: [],
    }

    pledges.forEach((pledge) => {
      const price = toNumber(pledge.priceCeiling)
      if (price > 0) {
        const lobby = pledge.user.lobbies[0]
        const intensity = lobby?.intensity || 'NEAT_IDEA'
        if (!intensityPrices[intensity]) {
          intensityPrices[intensity] = []
        }
        intensityPrices[intensity].push(price)
      }
    })

    const byIntensity: IntensityPricing = {
      neatIdea: {
        avg:
          intensityPrices['NEAT_IDEA'].length > 0
            ? Math.round(
                (intensityPrices['NEAT_IDEA'].reduce((a, b) => a + b, 0) /
                  intensityPrices['NEAT_IDEA'].length) *
                  100
              ) / 100
            : 0,
        count: intensityPrices['NEAT_IDEA'].length,
      },
      probablyBuy: {
        avg:
          intensityPrices['PROBABLY_BUY'].length > 0
            ? Math.round(
                (intensityPrices['PROBABLY_BUY'].reduce((a, b) => a + b, 0) /
                  intensityPrices['PROBABLY_BUY'].length) *
                  100
              ) / 100
            : 0,
        count: intensityPrices['PROBABLY_BUY'].length,
      },
      takeMyMoney: {
        avg:
          intensityPrices['TAKE_MY_MONEY'].length > 0
            ? Math.round(
                (intensityPrices['TAKE_MY_MONEY'].reduce((a, b) => a + b, 0) /
                  intensityPrices['TAKE_MY_MONEY'].length) *
                  100
              ) / 100
            : 0,
        count: intensityPrices['TAKE_MY_MONEY'].length,
      },
    }

    // Demand curve: at each price point, how many would buy at or above that price
    const uniquePrices = [...new Set(sortedPrices)].sort((a, b) => a - b)
    const demandCurve: DemandPoint[] = uniquePrices.slice(0, 20).map((price) => {
      const buyersAtPrice = prices.filter((p) => p >= price).length
      return {
        price: Math.round(price * 100) / 100,
        estimatedBuyers: buyersAtPrice,
      }
    })

    // Find optimal price (maximize revenue = price * buyers)
    let optimalPrice = medianPrice
    let maxRevenue = 0

    // Check all unique prices in the dataset
    uniquePrices.forEach((price) => {
      const buyers = prices.filter((p) => p >= price).length
      const revenue = price * buyers
      if (revenue > maxRevenue) {
        maxRevenue = revenue
        optimalPrice = price
      }
    })

    // Also check round price points
    for (let p = Math.max(1, Math.floor(minPrice)); p <= maxPrice; p += 5) {
      const buyers = prices.filter((price) => price >= p).length
      const revenue = p * buyers
      if (revenue > maxRevenue) {
        maxRevenue = revenue
        optimalPrice = p
      }
    }

    optimalPrice = Math.round(optimalPrice * 100) / 100
    maxRevenue = Math.round(maxRevenue * 100) / 100

    return {
      totalResponses: prices.length,
      averagePrice: Math.round(averagePrice * 100) / 100,
      medianPrice: Math.round(medianPrice * 100) / 100,
      modePrice: Math.round(parseFloat(modePrice.toString()) * 100) / 100,
      priceRange: {
        min: Math.round(minPrice * 100) / 100,
        max: Math.round(maxPrice * 100) / 100,
      },
      distribution,
      suggestedPricePoints,
      byIntensity,
      demandCurve,
      optimalPrice,
      maxRevenue,
    }
  } catch (error) {
    console.error('[analyzePricing]', error)
    throw error
  }
}
