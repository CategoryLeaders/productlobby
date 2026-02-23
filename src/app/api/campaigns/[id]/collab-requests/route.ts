/**
 * Campaign Collaboration Requests API
 * GET /api/campaigns/[id]/collab-requests - Lists collaboration requests for a campaign
 * POST /api/campaigns/[id]/collab-requests - Submit a collaboration request
 *
 * Uses ContributionEvent with SOCIAL_SHARE + metadata action: 'collab_request'
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CollabRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterHandle?: string
  requesterAvatar?: string
  message: string
  roleWanted: 'contributor' | 'reviewer' | 'promoter' | 'other'
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

/**
 * GET /api/campaigns/[id]/collab-requests
 * Lists collaboration requests for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const user = await getCurrentUser()

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const requests = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'collab_request',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const collabRequests: CollabRequest[] = requests.map((event) => {
      const metadata = event.metadata as Record<string, unknown>
      return {
        id: event.id,
        requesterId: event.userId,
        requesterName: event.user?.displayName || 'Unknown User',
        requesterHandle: event.user?.handle || undefined,
        requesterAvatar: event.user?.avatar || undefined,
        message: (metadata.message as string) || '',
        roleWanted: (metadata.roleWanted as string) as CollabRequest['roleWanted'],
        status: (metadata.status as string) as CollabRequest['status'],
        createdAt: event.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      data: collabRequests,
      count: collabRequests.length,
      isCreator: user?.id === campaign.creatorUserId,
    })
  } catch (error) {
    console.error('Error fetching collab requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/collab-requests
 * Submit a collaboration request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const { message, roleWanted } = await request.json()

    if (!message || !roleWanted) {
      return NextResponse.json(
        { success: false, error: 'Message and role are required' },
        { status: 400 }
      )
    }

    if (
      !['contributor', 'reviewer', 'promoter', 'other'].includes(roleWanted)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid role requested' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        title: true,
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot request to collaborate on your own campaign' },
        { status: 400 }
      )
    }

    const existingRequest = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'collab_request',
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a collaboration request for this campaign' },
        { status: 400 }
      )
    }

    const collabEvent = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          action: 'collab_request',
          message,
          roleWanted,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          submittedBy: user.displayName,
        },
      },
    })

    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        displayName: true,
        handle: true,
        avatar: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Collaboration request submitted',
      data: {
        id: collabEvent.id,
        requesterId: user.id,
        requesterName: user.displayName,
        requesterHandle: userInfo?.handle,
        requesterAvatar: userInfo?.avatar,
        message,
        roleWanted,
        status: 'pending',
        createdAt: collabEvent.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error submitting collab request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit collaboration request' },
      { status: 500 }
    )
  }
}
