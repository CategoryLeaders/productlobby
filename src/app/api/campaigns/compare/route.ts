/**
 * Campaign Comparison API
 * GET /api/campaigns/compare
 *
 * Accepts campaignIds query parameter (comma-separated)
 * Returns aggregated stats for comparing multiple campaigns
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CampaignComparisonData {
  id: string
  title: string
  slug: string
  category: string
  status: string
  path: string
  createdAt: string
  creator: {
    displayName: string
    handle: string | null
    avatar: string | null
  }
  supportersCount: number
  voteCount: number
  activityScore: number
  trendingScore: number
  signalScore: number | null
  targetedBrand?: {
    id: string
    name: string
  } | null
}

// GET /api/campaigns/compare?campaignIds=id1,id2,id3
export async function GET(request: NextRequest) {
  try {
    const campaignIds = request.nextUrl.searchParams.get('campaignIds')

    if (!campaignIds) {
      return NextResponse.json(
        { success: false, error: 'campaignIds query parameter is required' },
        { status: 400 }
      )
    }

    const ids = campaignIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one valid campaign ID is required' },
        { status: 400 }
      )
    }

    if (ids.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5 campaigns can be compared at once' },
        { status: 400 }
      )
    }

    // Fetch campaigns with related data
    const campaigns = await prisma.campaign.findMany({
      where: {
        id: { in: ids },
        status: { not: 'DRAFT' }, // Only show published campaigns
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        path: true,
        createdAt: true,
        signalScore: true,
        creator: {
          select: {
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // For each campaign, calculate aggregated metrics
    const campaignsWithMetrics = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get lobbies count
        const lobbiesCount = await prisma.lobby.count({
          where: { campaignId: campaign.id },
        })

        // Get pledges data
        const pledges = await prisma.pledge.findMany({
          where: { campaignId: campaign.id },
          select: {
            pledgeType: true,
            createdAt: true,
          },
        })

        // Calculate supporters (unique users who pledged)
        const supportPledges = pledges.filter((p) => p.pledgeType === 'SUPPORT')
        const intentPledges = pledges.filter((p) => p.pledgeType === 'INTENT')

        // Get recent activity count (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentActivity = await Promise.all([
          prisma.lobby.count({
            where: {
              campaignId: campaign.id,
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          prisma.pledge.count({
            where: {
              campaignId: campaign.id,
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          prisma.comment.count({
            where: {
              campaignId: campaign.id,
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
        ])

        const activityScore = recentActivity.reduce((sum, count) => sum + count, 0)

        // Calculate trending score based on recent engagement
        const totalEngagement = lobbiesCount + pledges.length
        const engagementVelocity = activityScore / (totalEngagement || 1)
        const trendingScore = Math.min(100, Math.round(engagementVelocity * 10))

        return {
          id: campaign.id,
          title: campaign.title,
          slug: campaign.slug,
          category: campaign.category,
          status: campaign.status,
          path: campaign.path,
          createdAt: campaign.createdAt.toISOString(),
          creator: campaign.creator,
          targetedBrand: campaign.targetedBrand,
          supportersCount: Math.max(lobbiesCount, supportPledges.length),
          voteCount: pledges.length,
          activityScore: activityScore,
          trendingScore: trendingScore,
          signalScore: campaign.signalScore || 0,
        } as CampaignComparisonData
      })
    )

    // Sort by the order requested (maintain requested order)
    const sortedCampaigns = ids
      .map((id) => campaignsWithMetrics.find((c) => c.id === id))
      .filter((c) => c !== undefined) as CampaignComparisonData[]

    const response = NextResponse.json({
      success: true,
      data: sortedCampaigns,
      count: sortedCampaigns.length,
    })

    // Add cache headers - campaigns comparison data can be cached briefly
    response.headers.set('Cache-Control', 'private, max-age=60') // 1 minute cache

    return response
  } catch (error) {
    console.error('Campaign comparison error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign comparison data' },
      { status: 500 }
    )
  }
}
