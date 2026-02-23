import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface GoalResponse {
  success: boolean
  data: {
    lobbyCount: number
    goal: number
    percentage: number
  }
}

// Default goal for campaigns (1000 supporters)
const DEFAULT_GOAL = 1000

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GoalResponse | { error: string }>> {
  try {
    const campaignId = params.id

    // Fetch campaign with verified lobby count
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        description: true,
        _count: {
          select: {
            lobbies: {
              where: {
                status: 'VERIFIED',
              },
            },
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Parse goal from description metadata or use default
    let goal = DEFAULT_GOAL

    // Try to extract goal from description JSON metadata
    if (campaign.description) {
      try {
        // Check if description contains JSON metadata
        const metadataMatch = campaign.description.match(/"goal"\s*:\s*(\d+)/)
        if (metadataMatch) {
          goal = parseInt(metadataMatch[1], 10)
        }
      } catch {
        // If parsing fails, use default
        goal = DEFAULT_GOAL
      }
    }

    const lobbyCount = campaign._count.lobbies
    const percentage = Math.round((lobbyCount / goal) * 100)

    return NextResponse.json({
      success: true,
      data: {
        lobbyCount,
        goal,
        percentage,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/goal]', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign goal data' },
      { status: 500 }
    )
  }
}
