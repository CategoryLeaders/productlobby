import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import {
  getCampaignTimeSeries,
  getConversionFunnel,
  getLobbyIntensityBreakdown,
  getEngagementMetrics,
  getPeakActivityTimes,
} from '@/lib/analytics-engine'
import { subDays } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: campaignId } = await params

    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric') || 'all'
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = subDays(endDate, days)

    if (metric === 'signalScore' || metric === 'all') {
      const signalTrend = await getCampaignTimeSeries(campaignId, 'signalScore', startDate, endDate)
      if (metric === 'signalScore') {
        return NextResponse.json({ signalTrend })
      }
    }

    if (metric === 'lobbyIntensity' || metric === 'all') {
      const lobbyIntensity = await getLobbyIntensityBreakdown(campaignId)
      if (metric === 'lobbyIntensity') {
        return NextResponse.json({ lobbyIntensity })
      }
    }

    if (metric === 'engagement' || metric === 'all') {
      const engagement = await getEngagementMetrics(campaignId)
      if (metric === 'engagement') {
        return NextResponse.json({ engagement })
      }
    }

    if (metric === 'funnel' || metric === 'all') {
      const funnel = await getConversionFunnel(campaignId)
      if (metric === 'funnel') {
        return NextResponse.json({ funnel })
      }
    }

    if (metric === 'peakActivity' || metric === 'all') {
      const peakActivity = await getPeakActivityTimes(campaignId)
      if (metric === 'peakActivity') {
        return NextResponse.json({ peakActivity })
      }
    }

    const signalTrend = await getCampaignTimeSeries(campaignId, 'signalScore', startDate, endDate)
    const lobbyIntensity = await getLobbyIntensityBreakdown(campaignId)
    const engagement = await getEngagementMetrics(campaignId)
    const funnel = await getConversionFunnel(campaignId)
    const peakActivity = await getPeakActivityTimes(campaignId)

    return NextResponse.json({
      signalTrend,
      lobbyIntensity,
      engagement,
      funnel,
      peakActivity,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Campaign analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
