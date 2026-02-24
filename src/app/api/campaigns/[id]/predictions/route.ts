export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface Prediction {
  id: string
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  trend: 'up' | 'down' | 'stable'
  factors: string[]
}

interface PredictionsResponse {
  success: boolean
  data?: Prediction[]
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<PredictionsResponse>> {
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

    // Check authorization - only creator can access predictions
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simulated predictions data
    const predictions: Prediction[] = [
      {
        id: 'pred-1',
        metric: 'Supporter Growth',
        currentValue: 1250,
        predictedValue: 2100,
        confidence: 87,
        timeframe: 'Next 30 days',
        trend: 'up',
        factors: [
          'Recent media coverage increased visibility',
          'High engagement rate on recent posts',
          'Seasonal demand trending upward',
          'Partner organization endorsements',
        ],
      },
      {
        id: 'pred-2',
        metric: 'Engagement Rate',
        currentValue: 12.5,
        predictedValue: 15.8,
        confidence: 82,
        timeframe: 'Next 30 days',
        trend: 'up',
        factors: [
          'User sentiment trending positive',
          'Increased video content performance',
          'Community participation growth',
        ],
      },
      {
        id: 'pred-3',
        metric: 'Brand Response Likelihood',
        currentValue: 45,
        predictedValue: 68,
        confidence: 79,
        timeframe: 'Next 60 days',
        trend: 'up',
        factors: [
          'Campaign momentum building',
          'Industry attention increasing',
          'Media value reaching threshold',
          'Social proof accumulating',
        ],
      },
      {
        id: 'pred-4',
        metric: 'Donation Target',
        currentValue: 125000,
        predictedValue: 185000,
        confidence: 84,
        timeframe: 'Next 45 days',
        trend: 'up',
        factors: [
          'Funding velocity accelerating',
          'Major donor interest signals',
          'Campaign milestone approaching',
          'Tax incentive period open',
        ],
      },
      {
        id: 'pred-5',
        metric: 'Social Reach',
        currentValue: 245000,
        predictedValue: 420000,
        confidence: 88,
        timeframe: 'Next 30 days',
        trend: 'up',
        factors: [
          'Viral post probability high',
          'Influencer collaboration pending',
          'Algorithm favoring campaign type',
          'Network effect accelerating',
        ],
      },
    ]

    return NextResponse.json({
      success: true,
      data: predictions,
    })
  } catch (error) {
    console.error('Predictions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
