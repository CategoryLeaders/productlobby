import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get contribution events that are collaboration tasks
    const events = await prisma.contributionEvent.findMany({
      where: {
        campaignId: params.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'collab_task',
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const tasks = events.map((event: any) => ({
      id: event.id,
      title: event.metadata?.title || 'Untitled',
      description: event.metadata?.description || '',
      assignee: event.metadata?.assignee,
      status: event.metadata?.status || 'todo',
      priority: event.metadata?.priority || 'medium',
      createdAt: event.createdAt.toISOString(),
    }))

    // Return simulated tasks if empty
    if (tasks.length === 0) {
      return NextResponse.json({
        tasks: [
          {
            id: '1',
            title: 'Draft campaign messaging',
            description: 'Create core messaging points and talking points',
            assignee: 'Sarah',
            status: 'in_progress',
            priority: 'high',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Design social assets',
            description: 'Create graphics, videos, and social media content',
            assignee: 'Michael',
            status: 'todo',
            priority: 'high',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            title: 'Coordinate supporter outreach',
            description: 'Identify and contact key supporters and influencers',
            assignee: 'Emma',
            status: 'todo',
            priority: 'medium',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            title: 'Review brand response',
            description: 'Prepare responses to potential company inquiries',
            assignee: 'James',
            status: 'review',
            priority: 'medium',
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            title: 'Celebrate milestone',
            description: 'Plan celebration event for reaching 10K supporters',
            status: 'done',
            priority: 'low',
            createdAt: new Date().toISOString(),
          },
        ],
      })
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching collaboration tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collaboration tasks' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, priority } = await request.json()

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Create task as a contribution event
    const event = await prisma.contributionEvent.create({
      data: {
        campaignId: params.id,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          action: 'collab_task',
          title,
          description,
          priority,
          status: 'todo',
        },
      },
    })

    const task = {
      id: event.id,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: event.createdAt.toISOString(),
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating collaboration task:', error)
    return NextResponse.json(
      { error: 'Failed to create collaboration task' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId, status } = await request.json()

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Update the task status
    const event = await prisma.contributionEvent.findUnique({
      where: { id: taskId },
    })

    if (!event) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updatedEvent = await prisma.contributionEvent.update({
      where: { id: taskId },
      data: {
        metadata: {
          ...event.metadata,
          status,
        },
      },
    })

    const task = {
      id: updatedEvent.id,
      title: updatedEvent.metadata?.title || 'Untitled',
      description: updatedEvent.metadata?.description || '',
      assignee: updatedEvent.metadata?.assignee,
      status,
      priority: updatedEvent.metadata?.priority || 'medium',
      createdAt: updatedEvent.createdAt.toISOString(),
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error updating collaboration task:', error)
    return NextResponse.json(
      { error: 'Failed to update collaboration task' },
      { status: 500 }
    )
  }
}
