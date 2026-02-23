import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/campaigns/[id]/polls/[pollId]/vote - Vote on a poll option
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { pollId } = params
    const body = await request.json()
    const { optionId, rank } = body

    // Validate optionId
    if (!optionId || typeof optionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Option ID is required' },
        { status: 400 }
      )
    }

    // Find the poll and verify option exists
    const poll = await prisma.creatorPoll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json(
        { success: false, error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Check if poll is still active
    if (poll.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This poll is no longer active' },
        { status: 400 }
      )
    }

    // Validate option exists
    const option = poll.options.find((opt) => opt.id === optionId)
    if (!option) {
      return NextResponse.json(
        { success: false, error: 'Invalid option' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.creatorPollVote.findFirst({
      where: {
        pollId: poll.id,
        userId: user.id,
      },
    })

    // For SINGLE_SELECT, user can only vote once
    if (poll.pollType === 'SINGLE_SELECT' && existingVote) {
      return NextResponse.json(
        { success: false, error: 'You have already voted on this poll' },
        { status: 400 }
      )
    }

    // For MULTI_SELECT, check vote count and max selections
    if (poll.pollType === 'MULTI_SELECT') {
      const userVoteCount = await prisma.creatorPollVote.count({
        where: {
          pollId: poll.id,
          userId: user.id,
        },
      })

      // If this is a new vote and user is at max, reject
      if (!existingVote && userVoteCount >= poll.maxSelections) {
        return NextResponse.json(
          {
            success: false,
            error: `You can only select up to ${poll.maxSelections} options`,
          },
          { status: 400 }
        )
      }
    }

    // Create the vote
    const vote = await prisma.creatorPollVote.create({
      data: {
        pollId: poll.id,
        optionId: option.id,
        userId: user.id,
        rank: rank || null,
      },
      include: {
        option: true,
      },
    })

    // Get updated poll results
    const updatedPoll = await prisma.creatorPoll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            votes: {
              select: {
                id: true,
                userId: true,
              },
            },
          },
        },
        votes: {
          where: { userId: user.id },
          select: {
            id: true,
            optionId: true,
            rank: true,
          },
        },
      },
    })

    if (!updatedPoll) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated poll' },
        { status: 500 }
      )
    }

    // Calculate results
    const uniqueVoters = new Set(
      updatedPoll.options.flatMap((opt) =>
        opt.votes.map((v) => v.userId)
      )
    )
    const totalVotes = uniqueVoters.size

    const optionsWithResults = updatedPoll.options.map((opt) => {
      const voteCount = opt.votes.length
      const percentage =
        totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

      return {
        id: opt.id,
        text: opt.text,
        order: opt.order,
        voteCount,
        percentage,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPoll.id,
        campaignId: updatedPoll.campaignId,
        question: updatedPoll.question,
        status: updatedPoll.status,
        totalVotes,
        options: optionsWithResults,
        userVotes: updatedPoll.votes.map((v) => ({
          optionId: v.optionId,
          rank: v.rank,
        })),
      },
    })
  } catch (error) {
    console.error('[campaigns polls vote POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}
