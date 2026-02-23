/**
 * Campaign Demand Signal API
 * GET /api/campaigns/[id]/demand-signal
 *
 * Returns per-campaign demand signal metrics including:
 * - Total lobby count and growth trends
 * - Comment engagement metrics
 * - Unique contributor count
 * - Brand response status
 * - Calculated Demand Score (0-100)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params

    // Fetch the campaign with creator check
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        title: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - you do not own this campaign' },
        { status: 403 }
      )
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Get total lobby count
    const totalLobbies = await prisma.lobby.count({
      where: { campaignId },
    })

    // Get recent growth (last 7 days vs previous 7)
    const lobbiesLastSevenDays = await prisma.lobby.count({
      where: {
        campaignId,
        createdAt: { gte: sevenDaysAgo },
      },
    })

    const lobbiesPreviousSevenDays = await prisma.lobby.count({
      where: {
        campaignId,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    })

    // Calculate growth rate percentage
    const growthRate =
      lobbiesPreviousSevenDays > 0
        ? ((lobbiesLastSevenDays - lobbiesPreviousSevenDays) / lobbiesPreviousSevenDays) * 100
        : lobbiesLastSevenDays > 0
          ? 100
          : 0

    // Get comment count (visible comments only)
    const commentCount = await prisma.comment.count({
      where: {
        campaignId,
        status: 'VISIBLE',
      },
    })

    // Get unique contributor count (lobbies + comments)
    const lobbyContributors = await prisma.lobby.findMany({
      where: { campaignId },
      select: { userId: true },
      distinct: ['userId'],
    })

    const commentContributors = await prisma.comment.findMany({
      where: {
        campaignId,
        status: 'VISIBLE',
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    // Combine unique contributors
    const uniqueContributorIds = new Set([
      ...lobbyContributors.map(l => l.userId),
      ...commentContributors.map(c => c.userId),
    ])
    const uniqueContributorCount = uniqueContributorIds.size

    // Check if brand has responded
    const brandResponse = await prisma.brandResponse.findFirst({
      where: { campaignId },
      select: { id: true, status: true },
    })

    // Calculate Demand Score (0-100)
    // Formula: (Lobby count * 0.4) + (Growth rate * 0.3) + (Comments * 0.15) + (Contributors * 0.15)
    // Normalized to 0-100 scale

    // Normalize each component to 0-100
    const lobbyScore = Math.min((totalLobbies / 100) * 100, 100) // Cap at 100
    const growthScore = Math.min(Math.max(growthRate, 0) / 5 * 100, 100) // Growth > 500% = 100
    const commentScore = Math.min((commentCount / 50) * 100, 100) // 50+ comments = 100
    const contributorScore = Math.min((uniqueContributorCount / 30) * 100, 100) // 30+ contributors = 100

    const demandScore = Math.round(
      lobbyScore * 0.4 +
      growthScore * 0.3 +
      commentScore * 0.15 +
      contributorScore * 0.15
    )

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        campaignTitle: campaign.title,
        // Metrics
        totalLobbies,
        lobbiesLastSevenDays,
        lobbiesPreviousSevenDays,
        growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimals
        commentCount,
        uniqueContributorCount,
        brandResponseStatus: brandResponse?.status || 'NONE',
        // Demand Score
        demandScore,
        // Component Scores (for breakdown visualization)
        componentScores: {
          lobbies: Math.round(lobbyScore),
          growth: Math.round(growthScore),
          comments: Math.round(commentScore),
          contributors: Math.round(contributorScore),
        },
        // Raw values for breakdown
        breakdown: {
          lobbies: totalLobbies,
          growth: growthRate,
          comments: commentCount,
          contributors: uniqueContributorCount,
        },
      },
    })
  } catch (error) {
    console.error('Demand signal error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
