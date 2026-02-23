import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW'

interface VoteDistribution {
  high: number
  medium: number
  low: number
}

interface PriorityVoteResponse {
  campaignId: string
  voteDistribution: VoteDistribution
  totalVotes: number
  userVote?: PriorityLevel
  percentages: {
    high: number
    medium: number
    low: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: campaignId } = await params

    // Verify campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all priority votes for this campaign
    const votes = await db.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'priority_vote',
        },
      },
      select: {
        metadata: true,
      },
    })

    // Calculate vote distribution
    const voteDistribution: VoteDistribution = {
      high: 0,
      medium: 0,
      low: 0,
    }

    votes.forEach((event) => {
      const priority = (event.metadata as any)?.priority as PriorityLevel | undefined
      if (priority === 'HIGH') voteDistribution.high++
      else if (priority === 'MEDIUM') voteDistribution.medium++
      else if (priority === 'LOW') voteDistribution.low++
    })

    const totalVotes =
      voteDistribution.high + voteDistribution.medium + voteDistribution.low

    // Get user's vote if they have one
    const userVote = await db.contributionEvent.findFirst({
      where: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'priority_vote',
        },
      },
      select: {
        metadata: true,
      },
    })

    const userVotePriority = userVote
      ? ((userVote.metadata as any)?.priority as PriorityLevel | undefined)
      : undefined

    // Calculate percentages
    const percentages = {
      high: totalVotes > 0 ? Math.round((voteDistribution.high / totalVotes) * 100) : 0,
      medium:
        totalVotes > 0 ? Math.round((voteDistribution.medium / totalVotes) * 100) : 0,
      low: totalVotes > 0 ? Math.round((voteDistribution.low / totalVotes) * 100) : 0,
    }

    const response: PriorityVoteResponse = {
      campaignId,
      voteDistribution,
      totalVotes,
      userVote: userVotePriority,
      percentages,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Priority vote GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: campaignId } = await params
    const body = await request.json()
    const { priority } = body

    // Validate priority value
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value. Must be HIGH, MEDIUM, or LOW.' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await db.contributionEvent.findFirst({
      where: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'priority_vote',
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      const updatedEvent = await db.contributionEvent.update({
        where: { id: existingVote.id },
        data: {
          metadata: {
            action: 'priority_vote',
            priority,
            timestamp: new Date().toISOString(),
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Vote updated',
        vote: {
          campaignId,
          priority,
          isUpdate: true,
        },
      })
    }

    // Create new vote
    const newEvent = await db.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 1,
        metadata: {
          action: 'priority_vote',
          priority,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Vote recorded',
        vote: {
          campaignId,
          priority,
          isUpdate: false,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Priority vote POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
