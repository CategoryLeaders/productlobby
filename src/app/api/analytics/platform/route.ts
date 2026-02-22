import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { getPlatformOverview, getNewCampaignsAndLobbiesTimeSeries, getCategoryBreakdown, getTopCampaigns, getSignalDistribution, type PeriodType } from '@/lib/analytics-engine'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') || '30d') as PeriodType
    const metric = searchParams.get('metric') || 'all'

    if (metric === 'overview' || metric === 'all') {
      const overview = await getPlatformOverview(period)
      return NextResponse.json({ overview })
    }

    if (metric === 'timeseries') {
      const timeseries = await getNewCampaignsAndLobbiesTimeSeries(period === '7d' ? 7 : period === '30d' ? 30 : 90)
      return NextResponse.json({ timeseries })
    }

    if (metric === 'categories') {
      const categories = await getCategoryBreakdown()
      return NextResponse.json({ categories })
    }

    if (metric === 'topCampaigns') {
      const sortBy = searchParams.get('sortBy') as 'signal' | 'lobbies' | 'growth' | undefined
      const topCampaigns = await getTopCampaigns(sortBy || 'signal', 10)
      return NextResponse.json({ topCampaigns })
    }

    if (metric === 'signalDistribution') {
      const signalDistribution = await getSignalDistribution()
      return NextResponse.json({ signalDistribution })
    }

    const overview = await getPlatformOverview(period)
    const timeseries = await getNewCampaignsAndLobbiesTimeSeries(period === '7d' ? 7 : period === '30d' ? 30 : 90)
    const categories = await getCategoryBreakdown()
    const topCampaigns = await getTopCampaigns('signal', 10)
    const signalDistribution = await getSignalDistribution()

    return NextResponse.json({
      overview,
      timeseries,
      categories,
      topCampaigns,
      signalDistribution,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
