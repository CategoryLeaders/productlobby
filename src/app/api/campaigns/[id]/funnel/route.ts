import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface FunnelStage {
  name: string
  count: number
  conversionRate: number
  icon: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }]
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Stage 1: Page Views (all campaign visitors)
    // We'll use a synthetic view count based on lobbies and shares
    // Views = lobbies + shares + brand contacts (as a proxy for page views)
    const brandContactsCount = await prisma.brandResponse.count({
      where: { campaignId: campaign.id }
    })

    // Get shares count
    const sharesCount = await prisma.share.count({
      where: { campaignId: campaign.id }
    })

    // Get lobbies count (people who directly supported)
    const lobbiesCount = await prisma.lobby.count({
      where: { campaignId: campaign.id }
    })

    // Estimate page views: roughly lobbies / typical conversion rate
    // Using a factor of 10x lobbies as a conservative estimate for views
    const pageViews = Math.max(lobbiesCount * 10, lobbiesCount + sharesCount + brandContactsCount)

    // Stage 2: Lobbies/Supports (people who supported the campaign)
    const stage2Count = lobbiesCount

    // Stage 3: Social Shares (people who shared the campaign)
    const stage3Count = sharesCount

    // Stage 4: Brand Contacts (brand responses/inquiries)
    const stage4Count = brandContactsCount

    // Calculate conversion rates from previous stage
    const stage1Count = pageViews
    const stage2ConversionRate = stage1Count > 0 ? (stage2Count / stage1Count) * 100 : 0
    const stage3ConversionRate = stage2Count > 0 ? (stage3Count / stage2Count) * 100 : 0
    const stage4ConversionRate = stage3Count > 0 ? (stage4Count / stage3Count) * 100 : 0

    const stages: FunnelStage[] = [
      {
        name: 'Page Views',
        count: stage1Count,
        conversionRate: 100, // First stage is 100%
        icon: 'Eye'
      },
      {
        name: 'Lobbies/Supports',
        count: stage2Count,
        conversionRate: stage2ConversionRate,
        icon: 'ThumbsUp'
      },
      {
        name: 'Social Shares',
        count: stage3Count,
        conversionRate: stage3ConversionRate,
        icon: 'Share2'
      },
      {
        name: 'Brand Contacts',
        count: stage4Count,
        conversionRate: stage4ConversionRate,
        icon: 'Send'
      }
    ]

    // Calculate overall conversion rate
    const overallConversionRate = stage1Count > 0 ? (stage4Count / stage1Count) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        stages,
        summary: {
          totalViews: stage1Count,
          totalSupports: stage2Count,
          totalShares: stage3Count,
          totalBrandContacts: stage4Count,
          overallConversionRate: overallConversionRate.toFixed(2)
        }
      }
    })
  } catch (error) {
    console.error('Funnel API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
