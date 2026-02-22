import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * PATCH /api/campaigns/[id]/story
 * Updates the origin story fields for a campaign
 * Only the campaign creator can update their campaign's story
 */
export async function PATCH(
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

    const { id } = params
    const body = await request.json()
    const { originStory, pitchSummary, inspiration, problemSolved } = body

    // Validation
    const errors: Record<string, string> = {}

    if (originStory !== undefined && originStory !== null) {
      if (typeof originStory !== 'string') {
        errors.originStory = 'Must be a string'
      } else if (originStory.length > 5000) {
        errors.originStory = 'Origin story must be 5000 characters or less'
      }
    }

    if (pitchSummary !== undefined && pitchSummary !== null) {
      if (typeof pitchSummary !== 'string') {
        errors.pitchSummary = 'Must be a string'
      } else if (pitchSummary.length > 280) {
        errors.pitchSummary = 'Pitch summary must be 280 characters or less'
      }
    }

    if (inspiration !== undefined && inspiration !== null) {
      if (typeof inspiration !== 'string') {
        errors.inspiration = 'Must be a string'
      } else if (inspiration.length > 2000) {
        errors.inspiration = 'Inspiration must be 2000 characters or less'
      }
    }

    if (problemSolved !== undefined && problemSolved !== null) {
      if (typeof problemSolved !== 'string') {
        errors.problemSolved = 'Must be a string'
      } else if (problemSolved.length > 2000) {
        errors.problemSolved = 'Problem solved must be 2000 characters or less'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Check if campaign exists and user is the creator
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can update the story' },
        { status: 403 }
      )
    }

    // Build update data - only include fields that were provided
    const updateData: any = {}
    if (originStory !== undefined) updateData.originStory = originStory || null
    if (pitchSummary !== undefined) updateData.pitchSummary = pitchSummary || null
    if (inspiration !== undefined) updateData.inspiration = inspiration || null
    if (problemSolved !== undefined) updateData.problemSolved = problemSolved || null

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        originStory: true,
        pitchSummary: true,
        inspiration: true,
        problemSolved: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('[PATCH /api/campaigns/[id]/story]', error)
    return NextResponse.json(
      { error: 'Failed to update campaign story' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/campaigns/[id]/story
 * Retrieves the origin story for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        originStory: true,
        pitchSummary: true,
        inspiration: true,
        problemSolved: true,
        creatorUserId: true,
        creator: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(campaign)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/story]', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign story' },
      { status: 500 }
    )
  }
}
