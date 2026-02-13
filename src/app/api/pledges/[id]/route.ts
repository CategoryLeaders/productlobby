import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { UpdatePledgeSchema } from '@/types'
import { updateCachedSignalScore } from '@/lib/signal-score'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/pledges/[id] - Update a pledge
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    const pledge = await prisma.pledge.findUnique({
      where: { id },
      select: { userId: true, campaignId: true },
    })

    if (!pledge) {
      return NextResponse.json(
        { success: false, error: 'Pledge not found' },
        { status: 404 }
      )
    }

    if (pledge.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = UpdatePledgeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const updated = await prisma.pledge.update({
      where: { id },
      data: result.data,
    })

    // Update signal score asynchronously
    updateCachedSignalScore(pledge.campaignId).catch(console.error)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update pledge error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// DELETE /api/pledges/[id] - Remove a pledge
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params

    const pledge = await prisma.pledge.findUnique({
      where: { id },
      select: { userId: true, campaignId: true },
    })

    if (!pledge) {
      return NextResponse.json(
        { success: false, error: 'Pledge not found' },
        { status: 404 }
      )
    }

    if (pledge.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    await prisma.pledge.delete({ where: { id } })

    // Update signal score asynchronously
    updateCachedSignalScore(pledge.campaignId).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pledge error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
