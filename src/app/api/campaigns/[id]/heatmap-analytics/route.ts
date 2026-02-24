export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface HeatmapSection {
  name: string
  clicks: number
  views: number
  engagementRate: number
  avgTimeSpent: number
}

interface PeakHour {
  hour: number
  activity: number
}

interface PeakDay {
  day: string
  activity: number
}

interface HeatmapResponse {
  success: boolean
  data?: {
    sections: HeatmapSection[]
    peakHours: PeakHour[]
    peakDays: PeakDay[]
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<HeatmapResponse>> {
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

    // Check authorization - only creator can access analytics
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simulated heatmap data
    const sections: HeatmapSection[] = [
      {
        name: 'Campaign Header',
        clicks: 1240,
        views: 8532,
        engagementRate: 14.5,
        avgTimeSpent: 2.3,
      },
      {
        name: 'Call to Action',
        clicks: 892,
        views: 8532,
        engagementRate: 10.4,
        avgTimeSpent: 1.8,
      },
      {
        name: 'Supporting Details',
        clicks: 654,
        views: 8532,
        engagementRate: 7.7,
        avgTimeSpent: 3.5,
      },
      {
        name: 'Social Proof',
        clicks: 542,
        views: 8532,
        engagementRate: 6.3,
        avgTimeSpent: 2.1,
      },
      {
        name: 'Related Campaigns',
        clicks: 418,
        views: 8532,
        engagementRate: 4.9,
        avgTimeSpent: 1.5,
      },
      {
        name: 'Contact Information',
        clicks: 256,
        views: 8532,
        engagementRate: 3.0,
        avgTimeSpent: 1.2,
      },
    ]

    const peakHours: PeakHour[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      activity: Math.floor(Math.random() * 200 + 50),
    }))

    const peakDays: PeakDay[] = [
      { day: 'Monday', activity: 245 },
      { day: 'Tuesday', activity: 198 },
      { day: 'Wednesday', activity: 276 },
      { day: 'Thursday', activity: 312 },
      { day: 'Friday', activity: 289 },
      { day: 'Saturday', activity: 156 },
      { day: 'Sunday', activity: 142 },
    ]

    return NextResponse.json({
      success: true,
      data: {
        sections,
        peakHours,
        peakDays,
      },
    })
  } catch (error) {
    console.error('Heatmap analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
