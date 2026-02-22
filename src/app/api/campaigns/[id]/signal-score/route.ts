import { NextRequest, NextResponse } from 'next/server'
import { calculateSignalScore, SIGNAL_THRESHOLDS, CONVERSION_RATES } from '@/lib/signal-score'
import { prisma } from '@/lib/db'

/**
 * GET /api/campaigns/[id]/signal-score
 *
 * Returns the full signal score breakdown for a campaign, including:
 * - Overall score (0-100) and tier
 * - Revenue projections for brands
 * - Lobby conviction metrics
 * - Momentum data
 *
 * Used by:
 * - Brand dashboard (revenue projections, should-we-build-this analysis)
 * - Campaign detail page (signal strength indicator)
 * - Admin dashboard (campaign quality ranking)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        signalScore: true,
        signalScoreUpdatedAt: true,
        completenessScore: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate fresh signal score
    const result = await calculateSignalScore(campaignId)

    // Update cached score
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        signalScore: result.score,
        signalScoreUpdatedAt: new Date(),
      },
    })

    return NextResponse.json({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      score: result.score,
      tier: result.tier,
      thresholds: SIGNAL_THRESHOLDS,

      // Revenue projection for brands
      projection: {
        projectedCustomers: result.projectedCustomers,
        projectedRevenue: result.projectedRevenue,
        medianPrice: result.inputs.medianPriceCeiling,
        p90Price: result.inputs.p90PriceCeiling,
        conversionRates: CONVERSION_RATES,
      },

      // Lobby breakdown
      lobbies: {
        neatIdea: result.inputs.neatIdeaCount,
        probablyBuy: result.inputs.probablyBuyCount,
        takeMyMoney: result.inputs.takeMyMoneyCount,
        total: result.inputs.neatIdeaCount + result.inputs.probablyBuyCount + result.inputs.takeMyMoneyCount,
        conviction: result.lobbyConviction,
      },

      // Pledge data
      pledges: {
        support: result.inputs.supportCount,
        intent: result.inputs.intentCount,
        intentVerified: result.inputs.intentPhoneVerifiedCount,
      },

      // Momentum
      momentum: {
        value: result.momentum,
        last7Days: result.inputs.intentLast7Days,
        prev7Days: result.inputs.intentPrev7Days,
        trend: result.momentum > 1.2 ? 'growing' : result.momentum < 0.8 ? 'declining' : 'stable',
      },

      // Campaign completeness
      completeness: campaign.completenessScore,

      // Demand value
      demandValue: result.demandValue,

      // When to take action
      actionSuggestion:
        result.score >= SIGNAL_THRESHOLDS.SUGGEST_OFFER
          ? 'Strong demand detected. Consider creating an offer for this campaign.'
          : result.score >= SIGNAL_THRESHOLDS.HIGH_SIGNAL
            ? 'High signal. Run a poll or survey to refine the product spec.'
            : result.score >= SIGNAL_THRESHOLDS.NOTIFY_BRAND
              ? 'Growing interest. Monitor and engage with campaign updates.'
              : result.score >= SIGNAL_THRESHOLDS.TRENDING
                ? 'Trending. Campaign is gaining traction.'
                : 'Early stage. Campaign needs more support to generate strong signals.',

      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error calculating signal score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate signal score' },
      { status: 500 }
    )
  }
}
