import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey, checkRateLimit, logApiKeyUsage } from '@/lib/api-keys'

interface CategoryOverview {
  name: string
  campaignCount: number
  averageSignalScore: number
  totalLobbies: number
}

interface CategoriesResponse {
  data: CategoryOverview[]
  meta: {
    rateLimit: {
      remaining: number
      reset: string
    }
  }
}

const VALID_CATEGORIES = [
  'apparel',
  'tech',
  'audio',
  'wearables',
  'home',
  'sports',
  'automotive',
  'other',
]

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    const categories = await prisma.campaign.groupBy({
      by: ['category'],
      where: { status: 'LIVE' },
      _count: {
        id: true,
      },
      _avg: {
        signalScore: true,
      },
    })

    const categoryData: CategoryOverview[] = []

    for (const cat of categories) {
      const categoryName = cat.category

      const [totalLobbies] = await Promise.all([
        prisma.pledge.count({
          where: {
            campaign: {
              category: categoryName,
              status: 'LIVE',
            },
          },
        }),
      ])

      categoryData.push({
        name: categoryName,
        campaignCount: cat._count.id,
        averageSignalScore: Math.round(cat._avg.signalScore || 0),
        totalLobbies,
      })
    }

    categoryData.sort((a, b) => b.averageSignalScore - a.averageSignalScore)

    const response: CategoriesResponse = {
      data: categoryData,
      meta: {
        rateLimit: {
          remaining: rateLimit.remaining - 1,
          reset: rateLimit.resetTime.toISOString(),
        },
      },
    }

    await logApiKeyUsage(validation.keyId!, '/api/v1/categories', 200)

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
