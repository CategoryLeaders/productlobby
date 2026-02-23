import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// PATCH /api/campaigns/[id]/settings - Update campaign settings
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

    // Get campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
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
        { error: 'Unauthorized - only campaign creator can update settings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, status } = body

    // Validate inputs
    const updateData: any = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
      updateData.slug = slugify(title)
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        return NextResponse.json(
          { error: 'Description must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.description = description.trim()
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim().length === 0) {
        return NextResponse.json(
          { error: 'Category must be a non-empty string' },
          { status: 400 }
        )
      }
      updateData.category = category.trim()
    }

    if (status !== undefined) {
      const validStatuses = ['DRAFT', 'LIVE', 'PAUSED', 'CLOSED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
      },
    })

    return NextResponse.json(updatedCampaign)
  } catch (error) {
    console.error('[PATCH /api/campaigns/[id]/settings]', error)
    return NextResponse.json(
      { error: 'Failed to update campaign settings' },
      { status: 500 }
    )
  }
}
