import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey, checkRateLimit, logApiKeyUsage } from '@/lib/api-keys'

interface SignalBreakdown {
  socialMedia: number
  reviews: number
  news: number
  forums: number
}

interface DemandMetrics {
  total: number
  byIntensity: {
    high: number
    medium: number
    low: number
  }
}

interface CampaignDetail {
  id: string
  title: string
  description: string
  category: string
  signalScore: number
  signalBreakdown: SignalBreakdown
  demandMetrics: DemandMetrics
  targetedBrandName: string | null
  estimatedMarketSize: number
  createdAt: string
  updatedAt: string
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
        description: true,
        category: true,
        signalScore: true,
        targetBrand: true,
        estimatedMarketSize: true,
        pledges: {
          select: {
            intensity: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const demandMetrics: DemandMetrics = {
      total: campaign.pledges.length,
      byIntensity: {
        high: campaign.pledges.filter((p) => p.intensity === 'HIGH').length,
        medium: campaign.pledges.filter((p) => p.intensity === 'MEDIUM').length,
        low: campaign.pledges.filter((p) => p.intensity === 'LOW').length,
      },
    }

    const signalBreakdown: SignalBreakdown = {
      socialMedia: Math.round(campaign.signalScore * 0.4),
      reviews: Math.round(campaign.signalScore * 0.25),
      news: Math.round(campaign.signalScore * 0.2),
      forums: Math.round(campaign.signalScore * 0.15),
    }

    const response: { data: CampaignDetail; meta: any } = {
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        signalScore: campaign.signalScore,
        signalBreakdown,
        demandMetrics,
        targetedBrandName: campaign.targetBrand,
        estimatedMarketSize: campaign.estimatedMarketSize || 0,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
      meta: {
        rateLimit: {
          remaining: rateLimit.remaining - 1,
          reset: rateLimit.resetTime.toISOString(),
        },
      },
    }

    await logApiKeyUsage(validation.keyId!, `/api/v1/campaigns/${id}`, 200)

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
