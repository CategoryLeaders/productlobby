export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface Competitor {
  name: string
  category: string
  supporters: number
  engagement: number
  sentiment: number
  trend: 'up' | 'down' | 'stable'
}

interface MetricComparison {
  metricName: string
  campaignValue: number
  categoryAverage: number
  delta: number
}

interface BenchmarkData {
  campaignRank: number
  totalInCategory: number
  competitors: Competitor[]
  metrics: MetricComparison[]
}

interface CompetitorBenchmarkingResponse {
  success: boolean
  data?: BenchmarkData
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CompetitorBenchmarkingResponse>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simulated competitor data
    const competitors: Competitor[] = [
      {
        name: 'TechStartup Initiative',
        category: 'Technology',
        supporters: 8520,
        engagement: 68.5,
        sentiment: 82.3,
        trend: 'down',
      },
      {
        name: 'Green Future Coalition',
        category: 'Sustainability',
        supporters: 7230,
        engagement: 71.2,
        sentiment: 85.1,
        trend: 'up',
      },
      {
        name: 'Education Reform Alliance',
        category: 'Education',
        supporters: 6890,
        engagement: 65.8,
        sentiment: 79.4,
        trend: 'stable',
      },
      {
        name: 'Healthcare Access Network',
        category: 'Healthcare',
        supporters: 9100,
        engagement: 73.5,
        sentiment: 88.2,
        trend: 'up',
      },
      {
        name: 'Community Development Fund',
        category: 'Community',
        supporters: 5450,
        engagement: 62.1,
        sentiment: 76.8,
        trend: 'down',
      },
    ]

    // Simulated metrics comparison
    const metrics: MetricComparison[] = [
      {
        metricName: 'Engagement Rate',
        campaignValue: 78.5,
        categoryAverage: 68.2,
        delta: 10.3,
      },
      {
        metricName: 'Growth Rate',
        campaignValue: 42.8,
        categoryAverage: 35.6,
        delta: 7.2,
      },
      {
        metricName: 'Sentiment Score',
        campaignValue: 87.3,
        categoryAverage: 82.1,
        delta: 5.2,
      },
    ]

    const data: BenchmarkData = {
      campaignRank: 3,
      totalInCategory: 45,
      competitors,
      metrics,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching benchmark data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
