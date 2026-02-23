import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface FAQItem {
  id: string
  question: string
  answer: string | null
  askedBy: {
    id: string
    displayName: string
    avatar: string | null
  }
  answeredBy: {
    id: string
    displayName: string
    avatar: string | null
  } | null
  createdAt: string
  answeredAt: string | null
  isPinned: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; faqId: string }> }
): Promise<NextResponse> {
  try {
    const { id, faqId } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { answer } = body

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Answer is required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only campaign creator can answer questions' },
        { status: 403 }
      )
    }

    const question = await prisma.question.findUnique({
      where: { id: faqId },
      select: { campaignId: true },
    })

    if (!question || question.campaignId !== id) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: faqId },
      data: {
        answer: answer.trim(),
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
      },
    })

    const faqItem: FAQItem = {
      id: updatedQuestion.id,
      question: updatedQuestion.content,
      answer: updatedQuestion.answer,
      askedBy: {
        id: updatedQuestion.user.id,
        displayName: updatedQuestion.user.displayName,
        avatar: updatedQuestion.user.avatar,
      },
      answeredBy: updatedQuestion.answeredBy
        ? {
            id: updatedQuestion.answeredBy.id,
            displayName: updatedQuestion.answeredBy.displayName,
            avatar: updatedQuestion.answeredBy.avatar,
          }
        : null,
      createdAt: updatedQuestion.createdAt.toISOString(),
      answeredAt: updatedQuestion.answeredAt?.toISOString() || null,
      isPinned: updatedQuestion.isPinned,
    }

    return NextResponse.json({
      success: true,
      data: faqItem,
    })
  } catch (error) {
    console.error('Update FAQ error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
