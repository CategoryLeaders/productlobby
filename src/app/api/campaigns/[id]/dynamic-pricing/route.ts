import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

interface PricingTier {
  id: string
  name: string
  description: string
  basePrice: number
  currentPrice: number
  currency: string
  discount: number
  features: string[]
  supporters: number
  capacity?: number
  isPopular: boolean
}

interface PricingData {
  tiers: PricingTier[]
  totalRevenue: number
  projectedRevenue: number
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Simulated pricing data with dynamic pricing tiers
    const pricingData: PricingData = {
      tiers: [
        {
          id: 'tier-supporter',
          name: 'Supporter',
          description: 'Show your support',
          basePrice: 9.99,
          currentPrice: 7.99,
          currency: 'GBP',
          discount: 20,
          features: [
            'Name on supporter list',
            'Updates via email',
            'Community access',
            'Supporter badge',
          ],
          supporters: 4521,
          isPopular: false,
        },
        {
          id: 'tier-champion',
          name: 'Champion',
          description: 'Make a bigger impact',
          basePrice: 24.99,
          currentPrice: 17.49,
          currency: 'GBP',
          discount: 30,
          features: [
            'Everything in Supporter',
            'Priority supporter list',
            'Monthly newsletter',
            'Exclusive webinars',
            'Direct message access',
            'Recognition post',
          ],
          supporters: 892,
          capacity: 1000,
          isPopular: true,
        },
        {
          id: 'tier-vip',
          name: 'VIP',
          description: 'Be the driving force',
          basePrice: 49.99,
          currentPrice: 29.99,
          currency: 'GBP',
          discount: 40,
          features: [
            'Everything in Champion',
            'VIP early access',
            '1-on-1 consultation',
            'Quarterly strategy calls',
            'Co-branding opportunity',
            'Premium recognition',
            'Lifetime benefits',
          ],
          supporters: 156,
          capacity: 250,
          isPopular: false,
        },
      ],
      totalRevenue: 28475.32,
      projectedRevenue: 42189.75,
    }

    return NextResponse.json(
      {
        success: true,
        pricingData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching pricing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing data' },
      { status: 500 }
    )
  }
}
