import { NextRequest, NextResponse } from 'next/server'
import { calculateBusinessCase } from '@/lib/business-case'
import { prisma } from '@/lib/db'

/**
 * GET /api/campaigns/[id]/business-case
 *
 * Returns comprehensive business case analysis for a campaign.
 * This tool helps brands understand: "If we build this, how much could we make?"
 *
 * Query parameters:
 * - productionCost (optional): Cost per unit to factor into margins
 * - shippingCost (optional): Shipping cost per unit
 * - marketingBudget (optional): Marketing budget for the campaign
 *
 * Returns:
 * - Market sizing (total demand signals, weighted demand)
 * - Revenue projections (conservative, moderate, optimistic scenarios)
 * - Pricing insights (median, suggested price point)
 * - Conversion estimates by intensity tier
 * - Confidence metrics and data sufficiency assessment
 * - Break-even analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Fetch campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        signalScore: true,
        completenessScore: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch lobby data (intensity breakdown)
    const lobbies = await prisma.lobby.findMany({
      where: { campaignId, status: 'VERIFIED' },
      select: { intensity: true },
    })

    // Fetch pledge data
    const pledges = await prisma.pledge.findMany({
      where: { campaignId },
      select: { pledgeType: true, priceCeiling: true },
    })

    // Count lobbies by intensity
    const neatIdeaCount = lobbies.filter(l => l.intensity === 'NEAT_IDEA').length
    const probablyBuyCount = lobbies.filter(l => l.intensity === 'PROBABLY_BUY').length
    const takeMyMoneyCount = lobbies.filter(l => l.intensity === 'TAKE_MY_MONEY').length

    // Count pledges by type
    const supportPledges = pledges.filter(p => p.pledgeType === 'SUPPORT')
    const intentPledges = pledges.filter(p => p.pledgeType === 'INTENT')

    // Extract price ceilings from intent pledges
    const priceCeilings = intentPledges
      .map(p => p.priceCeiling)
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map(p => Number(p))

    // Calculate business case
    const businessCase = calculateBusinessCase({
      neatIdeaCount,
      probablyBuyCount,
      takeMyMoneyCount,
      supportCount: supportPledges.length,
      intentCount: intentPledges.length,
      intentVerifiedCount: 0, // Would need user.phoneVerified data if needed
      priceCeilings,
      signalScore: campaign.signalScore || 0,
      completenessScore: campaign.completenessScore || 0,
    })

    return NextResponse.json({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      campaignStatus: campaign.status,

      // Market sizing
      marketSizing: {
        totalDemandSignals: businessCase.totalDemandSignals,
        weightedDemand: businessCase.weightedDemand,
        lobbyBreakdown: {
          neatIdea: neatIdeaCount,
          probablyBuy: probablyBuyCount,
          takeMyMoney: takeMyMoneyCount,
          total: neatIdeaCount + probablyBuyCount + takeMyMoneyCount,
        },
        pledgeBreakdown: {
          support: supportPledges.length,
          intent: intentPledges.length,
          total: supportPledges.length + intentPledges.length,
        },
      },

      // Revenue scenarios
      revenueProjections: {
        conservative: {
          scenario: 'Conservative',
          description: 'Assume lower conversion rates (2% NEAT_IDEA, 15% PROBABLY_BUY, 45% TAKE_MY_MONEY)',
          customers: businessCase.conservative.customers,
          revenue: businessCase.conservative.revenue,
          profitMargin: businessCase.conservative.margin,
        },
        moderate: {
          scenario: 'Moderate',
          description: 'Expected case (5% NEAT_IDEA, 25% PROBABLY_BUY, 65% TAKE_MY_MONEY)',
          customers: businessCase.moderate.customers,
          revenue: businessCase.moderate.revenue,
          profitMargin: businessCase.moderate.margin,
        },
        optimistic: {
          scenario: 'Optimistic',
          description: 'Best case (10% NEAT_IDEA, 40% PROBABLY_BUY, 80% TAKE_MY_MONEY)',
          customers: businessCase.optimistic.customers,
          revenue: businessCase.optimistic.revenue,
          profitMargin: businessCase.optimistic.margin,
        },
      },

      // Pricing insights
      pricingInsights: {
        avgPriceCeiling: businessCase.avgPriceCeiling,
        medianPriceCeiling: businessCase.medianPriceCeiling,
        priceRange: businessCase.priceRange,
        suggestedPricePoint: businessCase.suggestedPricePoint,
        suggestedPriceReasoning: `Median price ceiling (${businessCase.medianPriceCeiling.toFixed(2)}) at 85% = sweet spot between value capture and market accessibility`,
      },

      // Conversion metrics
      conversionMetrics: {
        rates: businessCase.conversionRates,
        estimatedCustomers: businessCase.estimatedCustomers,
        totalDemandSignals: businessCase.totalDemandSignals,
        conversionRate:
          businessCase.totalDemandSignals > 0
            ? (
                ((businessCase.estimatedCustomers /
                  businessCase.totalDemandSignals) *
                100).toFixed(2) + '%'
              )
            : '0%',
      },

      // Confidence & data quality
      dataQuality: {
        confidenceLevel: businessCase.confidenceLevel,
        confidenceScore: businessCase.confidenceScore,
        dataSufficiency: businessCase.dataSufficiency,
        priceCeilingDataPoints: priceCeilings.length,
        totalSignals: businessCase.totalDemandSignals,
      },

      // Break-even analysis
      breakEvenAnalysis: {
        unitsSoldToBreakEven: businessCase.breakEven.unitsSold,
        revenueNeeded: businessCase.breakEven.revenueNeeded,
        estimatedTimeframe: businessCase.breakEven.timeToBreakEven,
      },

      // Additional insights
      insights: {
        hasStrongSignals: businessCase.totalDemandSignals > 100,
        hasPricingData: priceCeilings.length > 10,
        hasHighConfidence: businessCase.confidenceScore > 70,
        recommendedAction:
          businessCase.confidenceScore > 70
            ? 'High confidence. Proceed with offer creation.'
            : 'Gather more data through surveys or polls before committing.',
      },

      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error calculating business case:', error)
    return NextResponse.json(
      { error: 'Failed to calculate business case' },
      { status: 500 }
    )
  }
}
