import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/campaigns/[id]/questions/[questionId]/vote - Toggle upvote on a question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId, questionId } = params

    // Verify question exists and belongs to campaign
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (question.campaignId !== campaignId) {
      return NextResponse.json(
        { error: 'Question not found in this campaign' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId: user.id,
        },
      },
    })

    if (existingVote) {
      // Remove vote
      await prisma.questionVote.delete({
        where: {
          questionId_userId: {
            questionId,
            userId: user.id,
          },
        },
      })
    } else {
      // Add vote
      await prisma.questionVote.create({
        data: {
          questionId,
          userId: user.id,
        },
      })
    }

    // Get updated vote count
    const voteCount = await prisma.questionVote.count({
      where: { questionId },
    })

    return NextResponse.json({
      questionId,
      voteCount,
      userVoted: !existingVote, // If there was no vote, user now voted
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/questions/[questionId]/vote]', error)
    return NextResponse.json(
      { error: 'Failed to vote on question' },
      { status: 500 }
    )
  }
}
