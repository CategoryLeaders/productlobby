import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ImpactFactors {
  lobbyFactor: number
  commentFactor: number
  followBookmarkFactor: number
  shareFactor: number
  signalScoreFactor: number
}

interface ImpactScoreResponse {
  score: number
  breakdown: ImpactFactors
  rank: {
    position: number
    total: number
    percentile: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // Get campaign data
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        signalScore: true,
        lobbies: {
          select: { id: true },
        },
        comments: {
          select: { id: true },
        },
        follows: {
          select: { id: true },
        },
        bookmarks: {
          select: { id: true },
        },
        contributionEvents: {
          where: {
            eventType: 'SOCIAL_SHARE',
          },
          select: { id: true },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate factors with weights
    const lobbyCount = campaign.lobbies.length
    const commentCount = campaign.comments.length
    const followBookmarkCount = campaign.follows.length + campaign.bookmarks.length
    const shareCount = campaign.contributionEvents.length
    const signalScoreValue = campaign.signalScore ?? 0

    // Normalize values to 0-100 scale
    const maxLobbyCount = 1000 // Realistic max
    const maxCommentCount = 500
    const maxFollowBookmark = 1000
    const maxShares = 200
    const maxSignalScore = 100

    const lobbyFactor = (Math.min(lobbyCount, maxLobbyCount) / maxLobbyCount) * 100 * 0.3
    const commentFactor = (Math.min(commentCount, maxCommentCount) / maxCommentCount) * 100 * 0.2
    const followBookmarkFactor = (Math.min(followBookmarkCount, maxFollowBookmark) / maxFollowBookmark) * 100 * 0.15
    const shareFactor = (Math.min(shareCount, maxShares) / maxShares) * 100 * 0.15
    const signalScoreFactor = (Math.min(signalScoreValue, maxSignalScore) / maxSignalScore) * 100 * 0.2

    const score = Math.round(
      lobbyFactor + commentFactor + followBookmarkFactor + shareFactor + signalScoreFactor
    )

    // Calculate rank
    const allCampaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        signalScore: true,
        lobbies: { select: { id: true } },
        comments: { select: { id: true } },
        follows: { select: { id: true } },
        bookmarks: { select: { id: true } },
        contributionEvents: {
          where: { eventType: 'SOCIAL_SHARE' },
          select: { id: true },
        },
      },
    })

    const campaignScores = allCampaigns.map((c) => {
      const lCount = c.lobbies.length
      const cCount = c.comments.length
      const fbCount = c.follows.length + c.bookmarks.length
      const sCount = c.contributionEvents.length
      const ssValue = c.signalScore ?? 0

      const lFactor = (Math.min(lCount, maxLobbyCount) / maxLobbyCount) * 100 * 0.3
      const cFactor = (Math.min(cCount, maxCommentCount) / maxCommentCount) * 100 * 0.2
      const fbFactor = (Math.min(fbCount, maxFollowBookmark) / maxFollowBookmark) * 100 * 0.15
      const sFactor = (Math.min(sCount, maxShares) / maxShares) * 100 * 0.15
      const ssFactor = (Math.min(ssValue, maxSignalScore) / maxSignalScore) * 100 * 0.2

      return Math.round(lFactor + cFactor + fbFactor + sFactor + ssFactor)
    })

    const sortedScores = campaignScores.sort((a, b) => b - a)
    const position = sortedScores.findIndex((s) => s === score) + 1
    const percentile = Math.round(((sortedScores.length - position) / sortedScores.length) * 100)

    const response: ImpactScoreResponse = {
      score,
      breakdown: {
        lobbyFactor: Math.round(lobbyFactor),
        commentFactor: Math.round(commentFactor),
        followBookmarkFactor: Math.round(followBookmarkFactor),
        shareFactor: Math.round(shareFactor),
        signalScoreFactor: Math.round(signalScoreFactor),
      },
      rank: {
        position,
        total: sortedScores.length,
        percentile,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/impact]', error)
    return NextResponse.json(
      { error: 'Failed to calculate impact score' },
      { status: 500 }
    )
  }
}
