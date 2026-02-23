import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

interface Highlight {
  id: string
  type: string
  title: string
  description: string
  date: string
  icon: string
  metadata?: Record<string, any>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const highlights: Highlight[] = []

    // 1. Most Popular Comment - Find comment with most engagement/reactions
    const mostCommentedResult = await prisma.comment.findFirst({
      where: { campaignId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            handle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (mostCommentedResult) {
      highlights.push({
        id: `highlight-comment-${mostCommentedResult.id}`,
        type: 'Most Popular Comment',
        title: 'Most Popular Comment',
        description: `"${mostCommentedResult.content.substring(0, 60)}${mostCommentedResult.content.length > 60 ? '...' : ''}"${
          mostCommentedResult.user?.displayName
            ? ` by ${mostCommentedResult.user.displayName}`
            : ''
        }`,
        date: mostCommentedResult.createdAt.toISOString(),
        icon: 'MessageSquare',
        metadata: {
          commentId: mostCommentedResult.id,
          userId: mostCommentedResult.user?.handle,
        },
      })
    }

    // 2. First Supporter/Lobby - Get the earliest lobby/supporter
    const firstLobby = await prisma.lobby.findFirst({
      where: { campaignId },
      select: {
        id: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            handle: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 1,
    })

    if (firstLobby) {
      highlights.push({
        id: `highlight-lobby-${firstLobby.id}`,
        type: 'First Supporter',
        title: 'First Supporter',
        description: `${firstLobby.user?.displayName || 'Anonymous'} was the first to support this campaign`,
        date: firstLobby.createdAt.toISOString(),
        icon: 'Star',
        metadata: {
          lobbyId: firstLobby.id,
          userId: firstLobby.user?.handle,
        },
      })
    }

    // 3. Supporter Milestones - Count lobbyists and create milestone highlights
    const lobbyCount = await prisma.lobby.count({
      where: { campaignId },
    })

    // Create milestone highlights at 10, 50, 100, 500, 1000+ supporters
    const milestones = [10, 50, 100, 500, 1000]
    for (const milestone of milestones) {
      if (lobbyCount >= milestone) {
        // Find when campaign reached this milestone
        const lobbyAtMilestone = await prisma.lobby.findFirst({
          where: { campaignId },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
          skip: milestone - 1,
          take: 1,
        })

        if (lobbyAtMilestone) {
          highlights.push({
            id: `highlight-milestone-${milestone}`,
            type: `${milestone} Supporters Milestone`,
            title: `${milestone} Supporters Milestone`,
            description: `Campaign reached ${milestone} supporters! This is a major achievement.`,
            date: lobbyAtMilestone.createdAt.toISOString(),
            icon: 'Users',
            metadata: {
              milestoneCount: milestone,
              totalSupporters: lobbyCount,
            },
          })
        }
      }
    }

    // 4. Viral Share - Find share with most clicks
    const viralShare = await prisma.share.findFirst({
      where: { campaignId },
      select: {
        id: true,
        platform: true,
        clickCount: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
            handle: true,
          },
        },
      },
      orderBy: { clickCount: 'desc' },
      take: 1,
    })

    if (viralShare && viralShare.clickCount > 0) {
      highlights.push({
        id: `highlight-share-${viralShare.id}`,
        type: 'Viral Share',
        title: 'Viral Share',
        description: `${viralShare.user?.displayName || 'A supporter'} shared this campaign on ${viralShare.platform || 'social media'}, generating ${viralShare.clickCount} clicks`,
        date: viralShare.createdAt.toISOString(),
        icon: 'Share2',
        metadata: {
          shareId: viralShare.id,
          platform: viralShare.platform,
          clickCount: viralShare.clickCount,
        },
      })
    }

    // 5. Campaign Update Highlight - Most recent update
    const latestUpdate = await prisma.campaignUpdate.findFirst({
      where: { campaignId },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (latestUpdate) {
      highlights.push({
        id: `highlight-update-${latestUpdate.id}`,
        type: 'Campaign Update',
        title: 'Latest Update',
        description: latestUpdate.title,
        date: latestUpdate.createdAt.toISOString(),
        icon: 'Sparkles',
        metadata: {
          updateId: latestUpdate.id,
        },
      })
    }

    // 6. Brand Response Highlight - If brand has responded
    const brandResponse = await prisma.brandResponse.findFirst({
      where: { campaignId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        brand: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (brandResponse) {
      highlights.push({
        id: `highlight-response-${brandResponse.id}`,
        type: 'Brand Response',
        title: 'Brand Responded!',
        description: `${brandResponse.brand?.name || 'The brand'} responded to this campaign`,
        date: brandResponse.createdAt.toISOString(),
        icon: 'Star',
        metadata: {
          responseId: brandResponse.id,
          brandName: brandResponse.brand?.name,
        },
      })
    }

    // Sort highlights by date (most recent first), but keep milestone order
    highlights.sort((a, b) => {
      // Milestones should stay in order
      if (a.type.includes('Milestone') && b.type.includes('Milestone')) {
        return (
          parseInt(a.type.match(/\d+/)?.[0] || '0') -
          parseInt(b.type.match(/\d+/)?.[0] || '0')
        )
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json({
      success: true,
      highlights,
      total: highlights.length,
    })
  } catch (error) {
    console.error('Error fetching campaign highlights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign highlights' },
      { status: 500 }
    )
  }
}
