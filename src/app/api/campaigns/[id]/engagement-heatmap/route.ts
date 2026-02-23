import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface HeatmapData {
  date: string
  count: number
  level: number // 0-4 scale
}

/**
 * GET /api/campaigns/[id]/engagement-heatmap
 * Returns 84 days (12 weeks) of engagement data for a campaign
 * Counts lobbies + comments per day
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      },
      select: { id: true }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Calculate date range: last 84 days
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 83) // 84 days total (0-83)
    startDate.setHours(0, 0, 0, 0)

    // Get all lobbies and comments in the date range
    const [lobbies, comments] = await Promise.all([
      prisma.lobby.findMany({
        where: {
          campaignId: campaign.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true
        }
      }),
      prisma.comment.findMany({
        where: {
          campaignId: campaign.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          createdAt: true
        }
      })
    ])

    // Group by date and count engagement
    const engagementByDate = new Map<string, number>()

    // Add lobbies
    lobbies.forEach(lobby => {
      const dateStr = new Date(lobby.createdAt).toISOString().split('T')[0]
      engagementByDate.set(dateStr, (engagementByDate.get(dateStr) || 0) + 1)
    })

    // Add comments
    comments.forEach(comment => {
      const dateStr = new Date(comment.createdAt).toISOString().split('T')[0]
      engagementByDate.set(dateStr, (engagementByDate.get(dateStr) || 0) + 1)
    })

    // Find max count for level calculation
    const maxCount = Math.max(...Array.from(engagementByDate.values()), 1)

    // Generate 84 days of data
    const heatmapData: HeatmapData[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const count = engagementByDate.get(dateStr) || 0

      // Calculate level (0-4 scale)
      let level = 0
      if (count > 0) {
        const percentage = count / maxCount
        if (percentage <= 0.25) level = 1
        else if (percentage <= 0.5) level = 2
        else if (percentage <= 0.75) level = 3
        else level = 4
      }

      heatmapData.push({
        date: dateStr,
        count,
        level
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      data: heatmapData,
      range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: 84
      }
    })
  } catch (error) {
    console.error('Error fetching engagement heatmap:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagement heatmap' },
      { status: 500 }
    )
  }
}
