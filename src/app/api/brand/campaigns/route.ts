/**
 * Brand Campaigns List API
 * GET /api/brand/campaigns
 *
 * Returns list of campaigns targeted at brands the user has access to.
 * Returns aggregated data only - no individual user information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { aggregateLobbies, aggregatePledges } from '@/lib/privacy'

// GET /api/brand/campaigns
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    // Get brands where user is a member
    const brandMemberships = await prisma.brandTeam.findMany({
      where: { userId: user.id },
      select: { brandId: true },
    })

    const brandIds = brandMemberships.map((b: any) => b.brandId)

    if (brandIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      })
    }

    // Get all campaigns targeted at these brands
    const campaigns = await prisma.campaign.findMany({
      where: {
        targetedBrandId: { in: brandIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        path: true,
        currency: true,
        signalScore: true,
        createdAt: true,
        targetedBrand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // For each campaign, get aggregated metrics
    const campaignData = await Promise.all(
      campaigns.map(async (campaign: any) => {
        // Get lobbies and pledges
        const [lobbies, pledges] = await Promise.all([
          prisma.lobby.findMany({
            where: { campaignId: campaign.id },
            select: {
              intensity: true,
              status: true,
              createdAt: true,
            },
          }),
          prisma.pledge.findMany({
            where: { campaignId: campaign.id },
            select: {
              pledgeType: true,
              priceCeiling: true,
              createdAt: true,
            },
          }),
        ])

        const aggregatedLobbies = aggregateLobbies(lobbies)
        const aggregatedPledges = aggregatePledges(pledges)

        // Calculate revenue projection
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
          category: campaign.category,
          status: campaign.status,
          path: campaign.path,
          currency: campaign.currency,
          signalScore: campaign.signalScore,
          createdAt: campaign.createdAt,
          brandName: campaign.targetedBrand?.name,
          lobbyCount: aggregatedLobbies.total,
          supportPledges: aggregatedPledges.totalSupport,
          intentPledges: aggregatedPledges.totalIntent,
          estimatedRevenue: revenueProjection,
          medianPrice: aggregatedPledges.medianPriceCeiling,
        }
      })
    )

    // Create response with privacy headers
    const response = NextResponse.json({
      success: true,
      data: campaignData,
      count: campaignData.length,
    })

    // Add privacy headers
    response.headers.set('X-Privacy-Level', 'aggregated')
    response.headers.set('Cache-Control', 'private, max-age=300') // 5 minute cache

    return response
  } catch (error) {
    console.error('Brand campaigns list error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
