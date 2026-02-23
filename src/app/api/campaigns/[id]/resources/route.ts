import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ResourceRequestBody {
  title: string
  description?: string
  url: string
  resourceType: string
}

interface DeleteRequestBody {
  resourceId: string
}

// GET /api/campaigns/[id]/resources - Fetch resources for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

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

    // Fetch all resources stored as ContributionEvent
    const resources = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'campaign_resource',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedResources = resources.map((event) => ({
      id: event.id,
      title: (event.metadata as any)?.title || '',
      description: (event.metadata as any)?.description || '',
      url: (event.metadata as any)?.url || '',
      resourceType: (event.metadata as any)?.resourceType || 'other',
      createdAt: event.createdAt,
    }))

    return NextResponse.json(
      {
        resources: formattedResources,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching campaign resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/resources - Add new resource (creator only)
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

    // Verify campaign exists and user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only creator can add resources' },
        { status: 403 }
      )
    }

    const body: ResourceRequestBody = await request.json()

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!body.url || !body.url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate resourceType
    const validTypes = ['article', 'video', 'pdf', 'tool', 'other']
    const resourceType = body.resourceType || 'other'
    if (!validTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 400 }
      )
    }

    // Create ContributionEvent with resource metadata
    const event = await prisma.contributionEvent.create({
      data: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          action: 'campaign_resource',
          title: body.title.trim(),
          description: body.description?.trim() || '',
          url: body.url.trim(),
          resourceType,
        },
      },
    })

    return NextResponse.json(
      {
        resource: {
          id: event.id,
          title: (event.metadata as any).title,
          description: (event.metadata as any).description,
          url: (event.metadata as any).url,
          resourceType: (event.metadata as any).resourceType,
          createdAt: event.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating campaign resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id]/resources - Delete resource (creator only)
export async function DELETE(
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

    // Verify campaign exists and user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only creator can delete resources' },
        { status: 403 }
      )
    }

    const body: DeleteRequestBody = await request.json()

    if (!body.resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    // Verify the resource belongs to this campaign and user
    const resource = await prisma.contributionEvent.findUnique({
      where: { id: body.resourceId },
      select: {
        id: true,
        campaignId: true,
        userId: true,
        metadata: true,
      },
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    if (resource.campaignId !== campaignId || resource.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - cannot delete this resource' },
        { status: 403 }
      )
    }

    // Check if it's a campaign_resource
    if ((resource.metadata as any)?.action !== 'campaign_resource') {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 400 }
      )
    }

    // Delete the resource
    await prisma.contributionEvent.delete({
      where: { id: body.resourceId },
    })

    return NextResponse.json(
      { message: 'Resource deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting campaign resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
