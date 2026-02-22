import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PATCH /api/campaigns/[id]/questions/[questionId] - Answer or update question
export async function PATCH(
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
    const body = await request.json()

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        campaign: {
          select: { creatorUserId: true },
        },
      },
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

    // Handle answer (creator only)
    if (body.answer !== undefined) {
      if (question.campaign.creatorUserId !== user.id) {
        return NextResponse.json(
          { error: 'Only campaign creator can answer questions' },
          { status: 403 }
        )
      }

      const answer = body.answer?.trim()
      if (typeof answer !== 'string' || answer.length === 0) {
        return NextResponse.json(
          { error: 'Answer content is required' },
          { status: 400 }
        )
      }

      if (answer.length > 5000) {
        return NextResponse.json(
          { error: 'Answer must be 5000 characters or less' },
          { status: 400 }
        )
      }

      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: {
          answer,
          answeredById: user.id,
          answeredAt: new Date(),
          status: 'ANSWERED',
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
          answeredBy: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
          votes: true,
        },
      })

      return NextResponse.json({
        id: updatedQuestion.id,
        campaignId: updatedQuestion.campaignId,
        content: updatedQuestion.content,
        answer: updatedQuestion.answer,
        answeredAt: updatedQuestion.answeredAt,
        answeredBy: updatedQuestion.answeredBy,
        isPinned: updatedQuestion.isPinned,
        status: updatedQuestion.status,
        createdAt: updatedQuestion.createdAt,
        updatedAt: updatedQuestion.updatedAt,
        user: updatedQuestion.user,
        voteCount: updatedQuestion.votes.length,
        userVoted: false,
      })
    }

    // Handle content update (question asker only, within 15 minutes)
    if (body.content !== undefined) {
      if (question.userId !== user.id) {
        return NextResponse.json(
          { error: 'Only question author can update their question' },
          { status: 403 }
        )
      }

      // Check if within 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      if (question.createdAt < fifteenMinutesAgo) {
        return NextResponse.json(
          { error: 'Can only edit questions within 15 minutes of creation' },
          { status: 400 }
        )
      }

      const content = body.content?.trim()
      if (typeof content !== 'string' || content.length === 0) {
        return NextResponse.json(
          { error: 'Question content is required' },
          { status: 400 }
        )
      }

      if (content.length < 10 || content.length > 1000) {
        return NextResponse.json(
          { error: 'Question must be between 10 and 1000 characters' },
          { status: 400 }
        )
      }

      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: { content },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
          answeredBy: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
            },
          },
          votes: true,
        },
      })

      return NextResponse.json({
        id: updatedQuestion.id,
        campaignId: updatedQuestion.campaignId,
        content: updatedQuestion.content,
        answer: updatedQuestion.answer,
        answeredAt: updatedQuestion.answeredAt,
        answeredBy: updatedQuestion.answeredBy,
        isPinned: updatedQuestion.isPinned,
        status: updatedQuestion.status,
        createdAt: updatedQuestion.createdAt,
        updatedAt: updatedQuestion.updatedAt,
        user: updatedQuestion.user,
        voteCount: updatedQuestion.votes.length,
        userVoted: false,
      })
    }

    return NextResponse.json(
      { error: 'No update data provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[PATCH /api/campaigns/[id]/questions/[questionId]]', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id]/questions/[questionId] - Close/remove question
export async function DELETE(
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

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        campaign: {
          select: { creatorUserId: true },
        },
      },
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

    // Check authorization: campaign creator or question asker
    const isCreator = question.campaign.creatorUserId === user.id
    const isAsker = question.userId === user.id

    if (!isCreator && !isAsker) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this question' },
        { status: 403 }
      )
    }

    await prisma.question.delete({
      where: { id: questionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/campaigns/[id]/questions/[questionId]]', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
