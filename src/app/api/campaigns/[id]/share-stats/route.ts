import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all SOCIAL_SHARE contribution events for this campaign
    const shareEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE'
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            handle: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Count shares by platform from metadata
    const platformMap = new Map<string, number>()
    const platformDetails = new Map<string, {
      count: number
      recentSharers: Array<{
        userId: string
        displayName: string
        avatar: string | null
        handle: string | null
        timestamp: Date
      }>
    }>()

    for (const event of shareEvents) {
      const metadata = event.metadata as { platform?: string } | null
      const platform = metadata?.platform || 'UNKNOWN'

      // Count by platform
      platformMap.set(platform, (platformMap.get(platform) || 0) + 1)

      // Track recent sharers per platform
      if (!platformDetails.has(platform)) {
        platformDetails.set(platform, {
          count: platformMap.get(platform) || 0,
          recentSharers: []
        })
      }

      const details = platformDetails.get(platform)!
      if (details.recentSharers.length < 5) {
        details.recentSharers.push({
          userId: event.user.id,
          displayName: event.user.displayName,
          avatar: event.user.avatar,
          handle: event.user.handle,
          timestamp: event.createdAt
        })
      }
    }

    // Update platform counts
    for (const [platform, count] of platformMap.entries()) {
      const details = platformDetails.get(platform)!
      details.count = count
    }

    // Get recent sharers (unique users, last 5)
    const recentSharers = new Map<string, {
      userId: string
      displayName: string
      avatar: string | null
      handle: string | null
      timestamp: Date
    }>()

    for (const event of shareEvents) {
      if (recentSharers.size < 5) {
        const user = event.user
        if (!recentSharers.has(user.id)) {
          recentSharers.set(user.id, {
            userId: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
            handle: user.handle,
            timestamp: event.createdAt
          })
        }
      }
    }

    // Calculate total reach estimate
    // For now, use a base estimate of 500 per sharer
    // In a real scenario, you'd fetch actual follower counts
    const baseReachPerSharer = 500
    let totalReachEstimate = shareEvents.length * baseReachPerSharer

    // Try to get follower counts from user data if available
    // This would require storing follower count in the User model
    // For now, we'll use the estimate
    const uniqueSharerIds = new Set(shareEvents.map(e => e.userId))
    const estimatedReach = uniqueSharerIds.size * baseReachPerSharer

    // Get Share records for additional context (platform-specific shares)
    const shares = await prisma.share.findMany({
      where: { campaignId: campaign.id },
      select: {
        platform: true,
        clickCount: true,
        createdAt: true
      }
    })

    // Count clicks by platform
    const clicksByPlatform = new Map<string, number>()
    for (const share of shares) {
      clicksByPlatform.set(
        share.platform,
        (clicksByPlatform.get(share.platform) || 0) + share.clickCount
      )
    }

    // Get total watches/followers for social proof
    const followCount = await prisma.follow.count({
      where: { campaignId: campaign.id }
    })

    const lobbyCount = await prisma.lobby.count({
      where: { campaignId: campaign.id }
    })

    // Build platform breakdown
    const platformBreakdown = Array.from(platformMap.entries()).map(([platform, count]) => {
      const clicks = clicksByPlatform.get(platform) || 0
      return {
        platform,
        shareCount: count,
        clicks,
        recentSharers: platformDetails.get(platform)?.recentSharers || []
      }
    }).sort((a, b) => b.shareCount - a.shareCount)

    // Get shares for last 7 days (for chart data)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentShareEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by day for chart
    const sharesByDay = new Map<string, number>()
    for (const event of recentShareEvents) {
      const dateKey = event.createdAt.toISOString().split('T')[0]
      sharesByDay.set(dateKey, (sharesByDay.get(dateKey) || 0) + 1)
    }

    const sharesTimeline = Array.from(sharesByDay.entries()).map(([date, count]) => ({
      date,
      shares: count
    }))

    // Top sharers (users with multiple shares)
    const sharerCounts = new Map<string, {
      userId: string
      displayName: string
      avatar: string | null
      handle: string | null
      shareCount: number
    }>()

    for (const event of shareEvents) {
      const user = event.user
      const key = user.id
      if (!sharerCounts.has(key)) {
        sharerCounts.set(key, {
          userId: user.id,
          displayName: user.displayName,
          avatar: user.avatar,
          handle: user.handle,
          shareCount: 0
        })
      }
      sharerCounts.get(key)!.shareCount += 1
    }

    const topSharers = Array.from(sharerCounts.values())
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        totalShares: shareEvents.length,
        totalReachEstimate: estimatedReach,
        platformBreakdown,
        sharesTimeline,
        recentSharers: Array.from(recentSharers.values()),
        topSharers,
        socialProof: {
          peopleLobbied: lobbyCount,
          peopleWatching: followCount,
          totalShares: shareEvents.length
        }
      }
    })
  } catch (error) {
    console.error('Share stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
