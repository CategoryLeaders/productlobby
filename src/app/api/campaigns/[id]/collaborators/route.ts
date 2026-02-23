/**
 * Campaign Collaborators API
 * GET /api/campaigns/[id]/collaborators - List campaign collaborators
 * POST /api/campaigns/[id]/collaborators - Invite a collaborator
 *
 * This API manages campaign collaboration and invites.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

interface CollaboratorData {
  id: string
  email: string
  displayName: string
  handle: string | null
  avatar: string | null
  role: 'owner' | 'collaborator'
  invitedAt?: string
}

/**
 * GET /api/campaigns/[id]/collaborators
 * List all collaborators for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Get campaign with creator info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        creator: {
          select: {
            id: true,
            email: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        // If we had a collaborators model, we'd query it here
        // For now, we use metadata field (JSON) to store collaborator data
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Start with the creator as "owner"
    const collaborators: CollaboratorData[] = [
      {
        id: campaign.creator.id,
        email: campaign.creator.email,
        displayName: campaign.creator.displayName,
        handle: campaign.creator.handle,
        avatar: campaign.creator.avatar,
        role: 'owner',
      },
    ]

    // In a full implementation, we'd query a CampaignCollaborator model here
    // For MVP, we store collaborators in a JSON field in campaign metadata
    // This would require adding a collaborators field to Campaign model
    // For now, return just the creator

    return NextResponse.json({
      success: true,
      data: collaborators,
      count: collaborators.length,
    })
  } catch (error) {
    console.error('Error fetching collaborators:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collaborators' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/collaborators
 * Invite a user as a collaborator (creator only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const { handle, email } = await request.json()

    if (!handle && !email) {
      return NextResponse.json(
        { success: false, error: 'Either handle or email is required' },
        { status: 400 }
      )
    }

    // Get campaign and verify user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        creatorUserId: true,
        slug: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Only the creator can invite collaborators
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only the campaign creator can invite collaborators' },
        { status: 403 }
      )
    }

    // Find the user to invite
    let invitedUser = null
    if (handle) {
      invitedUser = await prisma.user.findUnique({
        where: { handle },
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true,
          avatar: true,
        },
      })
    } else if (email) {
      invitedUser = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true,
          avatar: true,
        },
      })
    }

    if (!invitedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent inviting yourself
    if (invitedUser.id === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot invite yourself as a collaborator' },
        { status: 400 }
      )
    }

    // Create a notification for the invited user using ContributionEvent as a reference
    // We'll use the metadata field to store collaboration invitation data
    await createNotification({
      userId: invitedUser.id,
      type: 'collaboration_invite',
      title: `Invited to collaborate on ${campaign.title}`,
      message: `${user.displayName} invited you to collaborate on their campaign.`,
      linkUrl: `/campaigns/${campaign.slug}`,
    })

    // Create a contribution event to track the collaboration invite
    await prisma.contributionEvent.create({
      data: {
        userId: invitedUser.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          invitedBy: user.id,
          invitedByName: user.displayName,
          invitedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${invitedUser.displayName}`,
      data: {
        id: invitedUser.id,
        email: invitedUser.email,
        displayName: invitedUser.displayName,
        handle: invitedUser.handle,
        avatar: invitedUser.avatar,
        role: 'collaborator',
      },
    })
  } catch (error) {
    console.error('Error inviting collaborator:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to invite collaborator' },
      { status: 500 }
    )
  }
}
