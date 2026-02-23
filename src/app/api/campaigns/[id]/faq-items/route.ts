/**
 * Campaign FAQ Items API
 * GET /api/campaigns/[id]/faq-items - Returns FAQ items for a campaign
 * POST /api/campaigns/[id]/faq-items - Creator adds FAQ item (question, answer)
 * DELETE /api/campaigns/[id]/faq-items - Creator removes FAQ item by event ID
 *
 * FAQ items are stored as ContributionEvent with SOCIAL_SHARE + metadata action: 'faq_item'
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface FAQItemResponse {
  id: string
  question: string
  answer: string
  createdAt: string
  createdBy: {
    id: string
    displayName: string
    avatar: string | null
  }
}

/**
 * GET /api/campaigns/[id]/faq-items
 * Returns all FAQ items for a campaign
 */
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

    const faqEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'faq_item',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const faqItems: FAQItemResponse[] = faqEvents.map((event) => {
      const metadata = event.metadata as Record<string, unknown>
      return {
        id: event.id,
        question: (metadata.question as string) || '',
        answer: (metadata.answer as string) || '',
        createdAt: event.createdAt.toISOString(),
        createdBy: {
          id: event.user.id,
          displayName: event.user.displayName,
          avatar: event.user.avatar,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: faqItems,
    })
  } catch (error) {
    console.error('Get FAQ items error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/faq-items
 * Creator adds a new FAQ item (question and answer)
 */
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
    const { question, answer } = body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Answer is required' },
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

    // Only creator can add FAQ items
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the campaign creator can add FAQ items' },
        { status: 403 }
      )
    }

    const metadata = {
      action: 'faq_item',
      question: question.trim(),
      answer: answer.trim(),
      createdBy: user.id,
      createdByName: user.displayName,
    }

    const faqEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    const faqItem: FAQItemResponse = {
      id: faqEvent.id,
      question: metadata.question,
      answer: metadata.answer,
      createdAt: faqEvent.createdAt.toISOString(),
      createdBy: {
        id: faqEvent.user.id,
        displayName: faqEvent.user.displayName,
        avatar: faqEvent.user.avatar,
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: faqItem,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create FAQ item error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/campaigns/[id]/faq-items
 * Creator removes an FAQ item by event ID
 */
export async function DELETE(
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
    const { eventId } = body

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
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

    // Only creator can delete FAQ items
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the campaign creator can remove FAQ items' },
        { status: 403 }
      )
    }

    const faqEvent = await prisma.contributionEvent.findUnique({
      where: { id: eventId },
      select: { id: true, campaignId: true, userId: true },
    })

    if (!faqEvent) {
      return NextResponse.json(
        { success: false, error: 'FAQ item not found' },
        { status: 404 }
      )
    }

    if (faqEvent.campaignId !== id) {
      return NextResponse.json(
        { success: false, error: 'FAQ item does not belong to this campaign' },
        { status: 400 }
      )
    }

    await prisma.contributionEvent.delete({
      where: { id: eventId },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'FAQ item deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete FAQ item error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
