import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/campaigns/[id]/supporters?search=query&limit=10
 * Returns supporters of a campaign for @mention autocomplete
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Find supporters (users who have lobbied this campaign)
    const whereClause: any = {
      campaignId,
      status: 'VERIFIED',
    }

    // If search query provided, filter by user display name or handle
    if (search.length > 0) {
      whereClause.user = {
        OR: [
          { displayName: { contains: search, mode: 'insensitive' } },
          { handle: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const lobbies = await prisma.lobby.findMany({
      where: whereClause,
      select: {
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
      distinct: ['userId'],
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const supporters = lobbies.map((lobby) => lobby.user)

    return NextResponse.json({
      success: true,
      data: supporters,
    })
  } catch (error) {
    console.error('Error fetching supporters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supporters' },
      { status: 500 }
    )
  }
}
