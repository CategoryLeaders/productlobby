import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey, checkRateLimit, logApiKeyUsage } from '@/lib/api-keys'

interface SignalDataPoint {
  date: string
  score: number
  trend: number
}

interface IntensityDistribution {
  intensity: string
  count: number
  percentage: number
}

interface SignalResponse {
  campaignId: string
  timeSeries: SignalDataPoint[]
  intensityDistribution: IntensityDistribution[]
  currentScore: number
  trend: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const apiKey = request.headers.get('x-api-key')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Provide X-API-Key header.' },
        { status: 401 }
      )
    }

    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid or revoked API key.' },
        { status: 401 }
      )
    }

    const rateLimit = await checkRateLimit(validation.keyId!)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. 1000 requests per hour.',
          remaining: 0,
          reset: rateLimit.resetTime.toISOString(),
        },
        { status: 429 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        signalScore: true,
        createdAt: true,
        updatedAt: true,
        pledges: {
          select: {
            createdAt: true,
            intensity: true,
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

    const intensityDistribution: IntensityDistribution[] = [
      {
        intensity: 'HIGH',
        count: campaign.pledges.filter((p) => p.intensity === 'HIGH').length,
        percentage: 0,
      },
      {
        intensity: 'MEDIUM',
        count: campaign.pledges.filter((p) => p.intensity === 'MEDIUM').length,
        percentage: 0,
      },
      {
        intensity: 'LOW',
        count: campaign.pledges.filter((p) => p.intensity === 'LOW').length,
        percentage: 0,
      },
    ]

    const totalPledges = campaign.pledges.length
    intensityDistribution.forEach((dist) => {
      dist.percentage = totalPledges > 0 ? Math.round((dist.count / totalPledges) * 100) : 0
    })

    const timeSeries: SignalDataPoint[] = []
    const dayMap = new Map<string, number>()

    campaign.pledges.forEach((pledge) => {
      const dateKey = pledge.createdAt.toISOString().split('T')[0]
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1)
    })

    const sortedDates = Array.from(dayMap.keys()).sort()
    let cumulativeScore = 0

    sortedDates.forEach((date, index) => {
      const dailyCount = dayMap.get(date) || 0
      cumulativeScore += dailyCount
      const trend = index > 0 ? ((cumulativeScore - (timeSeries[index - 1]?.score || 0)) / Math.max(1, timeSeries[index - 1]?.score || 1)) * 100 : 0

      timeSeries.push({
        date,
        score: cumulativeScore,
        trend: Math.round(trend),
      })
    })

    const response: { data: SignalResponse; meta: any } = {
      data: {
        campaignId: campaign.id,
        timeSeries,
        intensityDistribution,
        currentScore: campaign.signalScore,
        trend: timeSeries.length > 1 ? timeSeries[timeSeries.length - 1].trend : 0,
      },
      meta: {
        rateLimit: {
          remaining: rateLimit.remaining - 1,
          reset: rateLimit.resetTime.toISOString(),
        },
      },
    }

    await logApiKeyUsage(validation.keyId!, `/api/v1/campaigns/${id}/signals`, 200)

    const nextResponse = NextResponse.json(response, { status: 200 })
    nextResponse.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining - 1))
    nextResponse.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toISOString())

    return nextResponse
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      },
    }
  )
}
