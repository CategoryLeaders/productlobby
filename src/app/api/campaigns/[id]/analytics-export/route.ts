export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface AnalyticsExportResponse {
  success: boolean
  data?: {
    period: '7d' | '30d' | '90d' | 'all'
    totalViews: number
    uniqueVisitors: number
    conversionRate: number
    avgTimeOnPage: number
    lastUpdated: string
    dailyActivity: Array<{ date: string; views: number }>
    topReferrals: Array<{ source: string; count: number; percentage: number }>
    deviceBreakdown: {
      desktop: number
      mobile: number
      tablet: number
    }
    comparison: {
      viewsChange: number
      visitorsChange: number
      conversionChange: number
      timeChange: number
    }
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<AnalyticsExportResponse>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const periodParam = request.nextUrl.searchParams.get('period') || '30d'
    const period = ['7d', '30d', '90d', 'all'].includes(periodParam)
      ? (periodParam as '7d' | '30d' | '90d' | 'all')
      : '30d'

    // Calculate date range for current period
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
        startDate = new Date(0) // Beginning of time
        break
    }

    // Calculate date range for previous period (for comparison)
    const previousPeriodDays =
      period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - previousPeriodDays)
    const previousEnd = new Date(startDate)

    // Find campaign
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

    // Fetch contribution events for current period
    const currentEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    // Fetch contribution events for previous period
    const previousEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    })

    // Calculate metrics for current period
    const totalViews = currentEvents.length
    const uniqueVisitors = new Set(currentEvents.map(e => e.userId)).size
    const conversionRate = uniqueVisitors > 0 ? (totalViews / uniqueVisitors) * 100 : 0
    const avgTimeOnPage = calculateAvgTimeOnPage(currentEvents)

    // Calculate metrics for previous period
    const prevTotalViews = previousEvents.length
    const prevUniqueVisitors = new Set(previousEvents.map(e => e.userId)).size
    const prevConversionRate = prevUniqueVisitors > 0 ? (prevTotalViews / prevUniqueVisitors) * 100 : 0
    const prevAvgTimeOnPage = calculateAvgTimeOnPage(previousEvents)

    // Calculate percentage changes
    const viewsChange = calculateChange(prevTotalViews, totalViews)
    const visitorsChange = calculateChange(prevUniqueVisitors, uniqueVisitors)
    const conversionChange = calculateChange(prevConversionRate, conversionRate)
    const timeChange = calculateChange(prevAvgTimeOnPage, avgTimeOnPage)

    // Build daily activity data
    const dailyActivity = buildDailyActivity(currentEvents, startDate, now)

    // Build top referrals from metadata
    const topReferrals = extractTopReferrals(currentEvents)

    // Build device breakdown from metadata
    const deviceBreakdown = extractDeviceBreakdown(currentEvents)

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalViews,
        uniqueVisitors,
        conversionRate,
        avgTimeOnPage,
        lastUpdated: new Date().toISOString(),
        dailyActivity,
        topReferrals,
        deviceBreakdown,
        comparison: {
          viewsChange,
          visitorsChange,
          conversionChange,
          timeChange,
        },
      },
    })
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate average time on page from contribution events
 */
function calculateAvgTimeOnPage(events: any[]): number {
  if (events.length === 0) return 0

  const timesOnPage = events
    .map(e => {
      const timeOnPage = e.metadata?.timeOnPage
      return typeof timeOnPage === 'number' ? timeOnPage : 0
    })
    .filter(t => t > 0)

  if (timesOnPage.length === 0) return 0
  return timesOnPage.reduce((sum, t) => sum + t, 0) / timesOnPage.length
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Build daily activity data from events
 */
function buildDailyActivity(events: any[], startDate: Date, endDate: Date) {
  const dailyMap = new Map<string, number>()

  // Initialize all days with 0
  const current = new Date(startDate)
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0]
    dailyMap.set(dateStr, 0)
    current.setDate(current.getDate() + 1)
  }

  // Count events by day
  events.forEach(event => {
    const dateStr = event.createdAt.toISOString().split('T')[0]
    dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1)
  })

  // Convert to array and sort
  return Array.from(dailyMap.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Extract top referral sources from event metadata
 */
function extractTopReferrals(events: any[]): Array<{ source: string; count: number; percentage: number }> {
  const referralMap = new Map<string, number>()

  events.forEach(event => {
    const referrer = event.metadata?.referrer || 'Direct'
    referralMap.set(referrer, (referralMap.get(referrer) || 0) + 1)
  })

  const total = events.length
  const referrals = Array.from(referralMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return referrals
}

/**
 * Extract device breakdown from event metadata
 */
function extractDeviceBreakdown(events: any[]): { desktop: number; mobile: number; tablet: number } {
  const breakdown = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  }

  events.forEach(event => {
    const deviceType = event.metadata?.deviceType || 'desktop'
    if (deviceType === 'mobile') {
      breakdown.mobile++
    } else if (deviceType === 'tablet') {
      breakdown.tablet++
    } else {
      breakdown.desktop++
    }
  })

  return breakdown
}
