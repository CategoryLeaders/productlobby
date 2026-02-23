import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface FundingResponse {
  totalFunding: number
  goalAmount: number
  percentage: number
  contributorsCount: number
}

/**
 * Calculate funding based on lobby intensity values
 * NEAT_IDEA = 1 point
 * PROBABLY_BUY = 2 points
 * TAKE_MY_MONEY = 3 points
 */
function calculateIntensityValue(intensity: string): number {
  switch (intensity) {
    case 'NEAT_IDEA':
      return 1
    case 'PROBABLY_BUY':
      return 2
    case 'TAKE_MY_MONEY':
      return 3
    default:
      return 0
  }
}

/**
 * GET /api/campaigns/[id]/funding
 * Returns funding progress for a campaign
 * Calculates total from lobbies with intensity values
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: campaignId } = await params

    // Validate campaign ID
    if (!campaignId || typeof campaignId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        _count: {
          select: { lobbies: true },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all verified lobbies for this campaign with intensity values
    const lobbies = await prisma.lobby.findMany({
      where: {
        campaignId,
        status: 'VERIFIED',
      },
      select: {
        intensity: true,
      },
    })

    // Calculate total funding based on intensity values
    let totalFunding = 0
    lobbies.forEach((lobby) => {
      totalFunding += calculateIntensityValue(lobby.intensity)
    })

    // Set a default goal amount or derive from campaign metadata
    // Default goal: 100 points (33 TAKE_MY_MONEY or 50 PROBABLY_BUY, etc.)
    const goalAmount = 100

    // Calculate percentage
    const percentage = Math.min(
      Math.round((totalFunding / goalAmount) * 100),
      100
    )

    const response: FundingResponse = {
      totalFunding,
      goalAmount,
      percentage,
      contributorsCount: lobbies.length,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching campaign funding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
