import { NextRequest, NextResponse } from 'next/server'
import { analyzePricing } from '@/lib/pricing-analysis'

// GET /api/campaigns/[id]/pricing - Get pricing analysis for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Analyze pricing for this campaign
    const pricingData = await analyzePricing(id)

    return NextResponse.json(pricingData)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/pricing]', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing analysis' },
      { status: 500 }
    )
  }
}
