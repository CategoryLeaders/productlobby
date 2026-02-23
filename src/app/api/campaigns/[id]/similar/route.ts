import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/similar - Find campaigns that share supporters with the given campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Find the given campaign first
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, slug: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all users who have contributed to this campaign
    const contributorIds = await prisma.contributionEvent.findMany({
      where: { campaignId },
      select: { userId: true },
      distinct: ['userId'],
    })

    const userIds = contributorIds.map((ce) => ce.userId)

    if (userIds.length === 0) {
      // No contributors, return empty list
      return NextResponse.json({
        success: true,
        data: {
          campaignId,
          similarCampaigns: [],
        },
      })
    }

    // Find all other campaigns these users have also contributed to
    // Group by campaignId to count overlapping supporters
    const similarCampaignData = await prisma.contributionEvent.groupBy({
      by: ['campaignId'],
      where: {
        userId: { in: userIds },
        campaignId: { not: campaignId },
      },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    })

    // Get details of the similar campaigns
    const similarCampaignIds = similarCampaignData.map((item) => item.campaignId)

    const similarCampaigns = await prisma.campaign.findMany({
      where: {
        id: { in: similarCampaignIds },
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        media: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            lobbies: true,
            follows: true,
          },
        },
      },
    })

    // Map overlap counts to campaigns
    const overlapMap = new Map(
      similarCampaignData.map((item) => [item.campaignId, item._count.userId])
    )

    const resultCampaigns = similarCampaigns
      .map((campaign) => ({
        ...campaign,
        overlapCount: overlapMap.get(campaign.id) || 0,
      }))
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        totalContributors: userIds.length,
        similarCampaigns: resultCampaigns,
      },
    })
  } catch (error) {
    console.error('Get similar campaigns error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
