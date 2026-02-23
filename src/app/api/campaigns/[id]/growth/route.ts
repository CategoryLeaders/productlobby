export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    const campaignId = params.id

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case 'all':
        startDate = new Date(0) // Very old date to get all records
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch lobbies for this campaign
    const lobbies = await prisma.lobby.findMany({
      where: {
        campaignId: campaignId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by day and calculate cumulative count
    const dailyMap = new Map<string, number>()
    let cumulativeCount = 0

    lobbies.forEach((lobby) => {
      const dateStr = lobby.createdAt.toISOString().split('T')[0]
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1)
    })

    // Convert to array and calculate cumulative values
    const result = Array.from(dailyMap.entries())
      .map(([date, count]) => {
        cumulativeCount += count
        return {
          date,
          count,
          cumulative: cumulativeCount,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // If no data, return empty array
    if (result.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching campaign growth data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch growth data' },
      { status: 500 }
    )
  }
}
