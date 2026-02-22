import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: {
    id: string
    updateId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId, updateId } = params

    const update = await prisma.campaignUpdate.findUnique({
      where: { id: updateId },
      select: { campaignId: true },
    })

    if (!update || update.campaignId !== campaignId) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      )
    }

    const reactions = await prisma.updateReaction.groupBy({
      by: ['type'],
      where: { updateId },
      _count: {
        type: true,
      },
    })

    const reactionCounts = reactions.reduce(
      (acc, reaction) => {
        acc[reaction.type] = reaction._count.type
        return acc
      },
      {} as Record<string, number>
    )

    const user = await getCurrentUser()
    let userReaction: string | null = null

    if (user) {
      const userReact = await prisma.updateReaction.findFirst({
        where: {
          updateId,
          userId: user.id,
        },
        select: {
          type: true,
        },
      })

      userReaction = userReact?.type || null
    }

    return NextResponse.json({
      success: true,
      data: {
        counts: reactionCounts,
        userReaction,
      },
    })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId, updateId } = params
    const body = await request.json()
    const { type } = body

    if (!type || !['thumbsUp', 'heart', 'celebrate'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reaction type' },
        { status: 400 }
      )
    }

    const update = await prisma.campaignUpdate.findUnique({
      where: { id: updateId },
      select: { campaignId: true },
    })

    if (!update || update.campaignId !== campaignId) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      )
    }

    const existingReaction = await prisma.updateReaction.findFirst({
      where: {
        updateId,
        userId: user.id,
      },
    })

    if (existingReaction) {
      if (existingReaction.type === type) {
        await prisma.updateReaction.delete({
          where: {
            id: existingReaction.id,
          },
        })

        return NextResponse.json({
          success: true,
          action: 'removed',
        })
      } else {
        await prisma.updateReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            type,
          },
        })

        return NextResponse.json({
          success: true,
          action: 'changed',
        })
      }
    }

    await prisma.updateReaction.create({
      data: {
        updateId,
        userId: user.id,
        type,
      },
    })

    return NextResponse.json({
      success: true,
      action: 'added',
    })
  } catch (error) {
    console.error('Error creating reaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create reaction' },
      { status: 500 }
    )
  }
}
