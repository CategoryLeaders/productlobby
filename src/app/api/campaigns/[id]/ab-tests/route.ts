import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * Calculate A/B test metrics from ContributionEvents
 * Groups events by variant field in metadata
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(campaignId)
    const campaign = await prisma.campaign[isUuid ? 'findUnique' : 'findFirst']({
      where: isUuid ? { id: campaignId } : { slug: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all A/B test events for this campaign (SOCIAL_SHARE events with ab_test_event action)
    const abTestEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    })

    // Process events to extract variant data
    const variantA = {
      name: 'Variant A',
      views: 0,
      conversions: 0,
      conversionRate: 0,
    }

    const variantB = {
      name: 'Variant B',
      views: 0,
      conversions: 0,
      conversionRate: 0,
    }

    // Group events by variant
    abTestEvents.forEach((event: any) => {
      const metadata = event.metadata || {}
      
      // Check if this is an A/B test event
      if (metadata.action === 'ab_test_event') {
        const variant = metadata.variant || 'A'
        const isConversion = metadata.isConversion === true || metadata.isConversion === 'true'

        if (variant === 'A' || variant === 'a') {
          variantA.views += 1
          if (isConversion) {
            variantA.conversions += 1
          }
        } else if (variant === 'B' || variant === 'b') {
          variantB.views += 1
          if (isConversion) {
            variantB.conversions += 1
          }
        }
      }
    })

    // Calculate conversion rates
    variantA.conversionRate = variantA.views > 0 ? (variantA.conversions / variantA.views) * 100 : 0
    variantB.conversionRate = variantB.views > 0 ? (variantB.conversions / variantB.views) * 100 : 0

    // Determine winner based on statistical significance
    let winner: 'A' | 'B' | null = null
    let confidence = 0

    if (variantA.views > 0 && variantB.views > 0) {
      // Simple chi-square inspired confidence calculation
      const totalViews = variantA.views + variantB.views
      const expectedConversionRate = (variantA.conversions + variantB.conversions) / totalViews

      if (expectedConversionRate > 0) {
        // Calculate confidence based on sample sizes and effect size
        const variantAProportionDiff = Math.abs(variantA.conversionRate - expectedConversionRate * 100)
        const variantBProportionDiff = Math.abs(variantB.conversionRate - expectedConversionRate * 100)

        // Simple confidence calculation: weight by sample size and difference magnitude
        const sampleSizeWeight = Math.min(totalViews / 100, 1) // Max at 100 samples
        const effectSize = Math.max(variantAProportionDiff, variantBProportionDiff) / 100

        confidence = Math.min(100, Math.round(sampleSizeWeight * effectSize * 1000))

        // Determine winner if we have sufficient confidence
        if (confidence >= 60) {
          winner = variantA.conversionRate > variantB.conversionRate ? 'A' : 'B'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        variantA,
        variantB,
        winner,
        confidence: Math.max(0, Math.min(100, confidence)),
      },
    })
  } catch (error) {
    console.error('Error fetching A/B test data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch A/B test data' },
      { status: 500 }
    )
  }
}
