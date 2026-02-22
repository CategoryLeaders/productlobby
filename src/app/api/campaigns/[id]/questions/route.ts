import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/campaigns/[id]/questions - List questions for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const url = new URL(request.url)
    const sort = url.searchParams.get('sort') || 'popular'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be at least 1' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get current user for vote status
    const currentUser = await getCurrentUser()

    // Base query to count total questions
    const where = { campaignId }

    const total = await prisma.question.count({ where })

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'popular') {
      orderBy = { votes: { _count: 'desc' } }
    } else if (sort === 'unanswered') {
      // For unanswered, sort by vote count but filter for OPEN status
    }

    // Get questions with pinned first
    const questions = await prisma.question.findMany({
      where,
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
        votes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, orderBy],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Filter for unanswered if needed
    const filteredQuestions = sort === 'unanswered'
      ? questions.filter((q) => q.status === 'OPEN')
      : questions

    // Map to response format
    const formattedQuestions = filteredQuestions.map((question) => ({
      id: question.id,
      campaignId: question.campaignId,
      content: question.content,
      answer: question.answer,
      answeredAt: question.answeredAt,
      answeredBy: question.answeredBy,
      isPinned: question.isPinned,
      status: question.status,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      user: question.user,
      voteCount: question._count.votes,
      userVoted: currentUser
        ? question.votes.some((v) => v.userId === currentUser.id)
        : false,
    }))

    return NextResponse.json({
      questions: formattedQuestions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/questions]', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/questions - Ask a question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const { content } = await request.json()

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Validate content
    if (typeof content !== 'string' || content.trim().length === 0) {
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

    // Check rate limit: 5 questions per hour per user per campaign
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentQuestions = await prisma.question.count({
      where: {
        campaignId,
        userId: user.id,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    })

    if (recentQuestions >= 5) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can ask up to 5 questions per hour.',
        },
        { status: 429 }
      )
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        campaignId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
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
      id: question.id,
      campaignId: question.campaignId,
      content: question.content,
      answer: question.answer,
      answeredAt: question.answeredAt,
      isPinned: question.isPinned,
      status: question.status,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      user: question.user,
      voteCount: question.votes.length,
      userVoted: false,
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/questions]', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
