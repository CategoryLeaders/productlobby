import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/campaigns/[id]/lobby-reasons - Get lobby reasons with user info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Check if campaign exists
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

    // Get lobbies with reasons and user info, ordered by most recent
    const lobbyReasons = await prisma.lobby.findMany({
      where: {
        campaignId,
        status: 'VERIFIED',
        reason: {
          not: null,
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        intensity: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      reasons: lobbyReasons,
      count: lobbyReasons.length,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/lobby-reasons]', error)
    return NextResponse.json(
      { error: 'Failed to fetch lobby reasons' },
      { status: 500 }
    )
  }
}
