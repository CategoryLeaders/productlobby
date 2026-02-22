import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getRelatedCampaigns,
  getPersonalisedRecommendations,
} from '@/lib/recommendations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')
    const userId = searchParams.get('userId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 50)

    if (campaignId) {
      const recommendations = await getRelatedCampaigns(campaignId, limit)

      return NextResponse.json({
        success: true,
        data: recommendations.map((rec) => ({
          ...rec.campaign,
          recommendationScore: rec.score,
          recommendationReason: rec.reason,
        })),
        type: 'related',
      })
    }

    if (userId) {
      const user = await getCurrentUser()

      if (!user || user.id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const recommendations = await getPersonalisedRecommendations(userId, limit)

      return NextResponse.json({
        success: true,
        data: recommendations.map((rec) => ({
          ...rec.campaign,
          recommendationScore: rec.score,
          recommendationReason: rec.reason,
        })),
        type: 'personalised',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Either campaignId or userId parameter is required',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('[GET /api/campaigns/recommendations]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
