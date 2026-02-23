export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/campaigns/[id]/team - Fetch team members and pending invitations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
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

    // Fetch team members from ContributionEvent with action='team_member'
    const teamEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'team_member',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Parse team members from events
    const members = teamEvents
      .map((event) => {
        const metadata = event.metadata as any
        return {
          id: event.user.id,
          email: event.user.email,
          name: event.user.displayName,
          role: metadata?.role || 'Viewer',
          avatar: event.user.avatar,
          joinedAt: event.createdAt.toISOString(),
        }
      })
      .filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx) // Remove duplicates

    // Fetch pending invitations from events with action='pending_invitation'
    const pendingEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'pending_invitation',
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const pending = pendingEvents
      .map((event) => {
        const metadata = event.metadata as any
        return {
          id: event.id,
          email: metadata?.email || '',
          role: metadata?.role || 'Viewer',
          sentAt: event.createdAt.toISOString(),
        }
      })
      .filter((p) => p.email) // Filter out empty emails

    return NextResponse.json({
      members,
      pending,
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/team - Add a team member (creator only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { email, role = 'Viewer' } = body

    // Validate input
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!['Admin', 'Editor', 'Moderator', 'Viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
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

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can add team members' },
        { status: 403 }
      )
    }

    // Check if email is already invited or part of team
    const existingTeam = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'team_member',
        },
        user: {
          email,
        },
      },
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 409 }
      )
    }

    const existingInvite = await prisma.contributionEvent.findFirst({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'pending_invitation',
        },
      },
    })

    if (existingInvite) {
      const metadata = existingInvite.metadata as any
      if (metadata?.email === email) {
        return NextResponse.json(
          { error: 'Invitation already sent to this email' },
          { status: 409 }
        )
      }
    }

    // Create a pending invitation as a ContributionEvent
    await prisma.contributionEvent.create({
      data: {
        userId: user.id, // Creator's user ID
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          action: 'pending_invitation',
          email,
          role,
          invitedBy: user.id,
          invitedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: `Invitation sent to ${email}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id]/team - Remove a team member (creator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { memberId } = body

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
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

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can remove team members' },
        { status: 403 }
      )
    }

    // Find and delete the team member event
    const deletedEvent = await prisma.contributionEvent.deleteMany({
      where: {
        campaignId,
        userId: memberId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'team_member',
        },
      },
    })

    if (deletedEvent.count === 0) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Team member removed',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
