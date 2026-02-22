import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/campaigns/[id]/questions/[questionId]/pin - Toggle pin status
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

    // Get campaign to verify creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check authorization: only campaign creator can pin
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can pin questions' },
        { status: 403 }
      )
    }

    // Get question
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

    // If pinning, check max pinned limit
    if (!question.isPinned) {
      const pinnedCount = await prisma.question.count({
        where: {
          campaignId,
          isPinned: true,
        },
      })

      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: 'Maximum 3 pinned questions per campaign' },
          { status: 400 }
        )
      }
    }

    // Toggle pin status
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        isPinned: !question.isPinned,
      },
    })

    return NextResponse.json({
      questionId,
      isPinned: updatedQuestion.isPinned,
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/questions/[questionId]/pin]', error)
    return NextResponse.json(
      { error: 'Failed to pin question' },
      { status: 500 }
    )
  }
}
