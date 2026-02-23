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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const questions = await prisma.question.findMany({
      where: { campaignId: id },
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
      orderBy: [{ isPinned: 'desc' }, { answeredAt: 'desc' }, { createdAt: 'desc' }],
    })

    const faqItems: FAQItem[] = questions.map((q) => ({
      id: q.id,
      question: q.content,
      answer: q.answer,
      askedBy: {
        id: q.user.id,
        displayName: q.user.displayName,
        avatar: q.user.avatar,
      },
      answeredBy: q.answeredBy
        ? {
            id: q.answeredBy.id,
            displayName: q.answeredBy.displayName,
            avatar: q.answeredBy.avatar,
          }
        : null,
      createdAt: q.createdAt.toISOString(),
      answeredAt: q.answeredAt?.toISOString() || null,
      isPinned: q.isPinned,
    }))

    return NextResponse.json({
      success: true,
      data: faqItems,
    })
  } catch (error) {
    console.error('Get FAQ error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const isCreator = campaign.creatorUserId === user.id

    const newQuestion = await prisma.question.create({
      data: {
        campaignId: id,
        userId: user.id,
        content: question.trim(),
        answer: isCreator ? '(Creator answered)' : null,
        answeredById: isCreator ? user.id : null,
        answeredAt: isCreator ? new Date() : null,
        status: isCreator ? 'ANSWERED' : 'OPEN',
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
      id: newQuestion.id,
      question: newQuestion.content,
      answer: newQuestion.answer,
      askedBy: {
        id: newQuestion.user.id,
        displayName: newQuestion.user.displayName,
        avatar: newQuestion.user.avatar,
      },
      answeredBy: newQuestion.answeredBy
        ? {
            id: newQuestion.answeredBy.id,
            displayName: newQuestion.answeredBy.displayName,
            avatar: newQuestion.answeredBy.avatar,
          }
        : null,
      createdAt: newQuestion.createdAt.toISOString(),
      answeredAt: newQuestion.answeredAt?.toISOString() || null,
      isPinned: newQuestion.isPinned,
    }

    return NextResponse.json(
      {
        success: true,
        data: faqItem,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create FAQ error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
