import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Milestone thresholds for lobbies and comments
const LOBBY_MILESTONES = [10, 25, 50, 100, 250, 500, 1000]
const COMMENT_MILESTONES = [5, 10, 25, 50, 100]

interface MilestoneData {
  type: 'lobbies' | 'comments'
  threshold: number
  reached: boolean
}

interface ProgressMilestonesResponse {
  success: boolean
  data: {
    lobbyCount: number
    commentCount: number
    lobbyMilestones: MilestoneData[]
    commentMilestones: MilestoneData[]
    nextLobbyMilestone: { threshold: number; remaining: number } | null
    nextCommentMilestone: { threshold: number; remaining: number } | null
    lobbyProgressPercent: number
    commentProgressPercent: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProgressMilestonesResponse | { error: string }>> {
  try {
    const campaignId = params.id

    // Fetch campaign with counts
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        _count: {
          select: {
            lobbies: {
              where: {
                status: 'VERIFIED',
              },
            },
            comments: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const lobbyCount = campaign._count.lobbies
    const commentCount = campaign._count.comments

    // Calculate lobby milestones
    const lobbyMilestones: MilestoneData[] = LOBBY_MILESTONES.map((threshold) => ({
      type: 'lobbies',
      threshold,
      reached: lobbyCount >= threshold,
    }))

    // Calculate comment milestones
    const commentMilestones: MilestoneData[] = COMMENT_MILESTONES.map((threshold) => ({
      type: 'comments',
      threshold,
      reached: commentCount >= threshold,
    }))

    // Find next lobby milestone
    const nextLobbyThreshold = LOBBY_MILESTONES.find((m) => m > lobbyCount)
    const nextLobbyMilestone = nextLobbyThreshold
      ? { threshold: nextLobbyThreshold, remaining: nextLobbyThreshold - lobbyCount }
      : null

    // Find next comment milestone
    const nextCommentThreshold = COMMENT_MILESTONES.find((m) => m > commentCount)
    const nextCommentMilestone = nextCommentThreshold
      ? { threshold: nextCommentThreshold, remaining: nextCommentThreshold - commentCount }
      : null

    // Calculate progress to next milestone (as percentage)
    const prevLobbyThreshold = LOBBY_MILESTONES.filter((m) => m <= lobbyCount).pop() || 0
    const prevCommentThreshold = COMMENT_MILESTONES.filter((m) => m <= commentCount).pop() || 0

    const lobbyProgressPercent = nextLobbyMilestone
      ? Math.round(
        ((lobbyCount - prevLobbyThreshold) / (nextLobbyThreshold! - prevLobbyThreshold)) * 100
      )
      : 100

    const commentProgressPercent = nextCommentMilestone
      ? Math.round(
        ((commentCount - prevCommentThreshold) / (nextCommentThreshold! - prevCommentThreshold)) * 100
      )
      : 100

    return NextResponse.json({
      success: true,
      data: {
        lobbyCount,
        commentCount,
        lobbyMilestones,
        commentMilestones,
        nextLobbyMilestone,
        nextCommentMilestone,
        lobbyProgressPercent,
        commentProgressPercent,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/progress-milestones]', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress milestones' },
      { status: 500 }
    )
  }
}
