import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Challenge {
  id: string
  title: string
  description: string
  target: number
  deadline: string
  createdAt: string
  creatorId: string
}

// GET /api/campaigns/[id]/challenges - List active challenges for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

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

    // Get all challenge contribution events for this campaign
    const challengeEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        metadata: {
          path: ['type'],
          equals: 'CHALLENGE',
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transform to Challenge format, filtering for active (future deadline) challenges
    const challenges: Challenge[] = challengeEvents
      .map((event) => {
        const metadata = event.metadata as any
        return {
          id: event.id,
          title: metadata?.title || 'Unnamed Challenge',
          description: metadata?.description || '',
          target: metadata?.target || 0,
          deadline: metadata?.deadline || new Date().toISOString(),
          createdAt: event.createdAt.toISOString(),
          creatorId: event.userId,
        }
      })
      .filter((challenge) => new Date(challenge.deadline) > new Date())

    return NextResponse.json({
      success: true,
      data: {
        challenges,
        count: challenges.length,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/challenges]', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/challenges - Create a new challenge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params
    const body = await request.json()
    const { title, description, target, deadline } = body

    // Validate input
    if (!title || !description || !target || !deadline) {
      return NextResponse.json(
        { error: 'title, description, target, and deadline are required' },
        { status: 400 }
      )
    }

    if (typeof target !== 'number' || target <= 0) {
      return NextResponse.json(
        { error: 'target must be a positive number' },
        { status: 400 }
      )
    }

    const deadlineDate = new Date(deadline)
    if (deadlineDate <= new Date()) {
      return NextResponse.json(
        { error: 'deadline must be in the future' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can create challenges' },
        { status: 403 }
      )
    }

    // Create challenge as a ContributionEvent with type in metadata
    const challengeEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'BRAND_OUTREACH',
        points: 0,
        metadata: {
          type: 'CHALLENGE',
          title: title.trim(),
          description: description.trim(),
          target,
          deadline: deadlineDate.toISOString(),
        },
      },
    })

    const challenge: Challenge = {
      id: challengeEvent.id,
      title,
      description,
      target,
      deadline: deadlineDate.toISOString(),
      createdAt: challengeEvent.createdAt.toISOString(),
      creatorId: user.id,
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          challenge,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/challenges]', error)
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}
