import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface AudienceSegment {
  name: string
  count: number
  percentage: number
  growth: number
  characteristics: string[]
}

interface DemographicItem {
  label: string
  value: number
}

interface AudienceInsightsResponse {
  totalAudience: number
  segments: AudienceSegment[]
  demographics: {
    ageGroups: DemographicItem[]
    interests: DemographicItem[]
    platforms: DemographicItem[]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Simulated audience data based on spec
    const simulatedData: AudienceInsightsResponse = {
      totalAudience: 4567,
      segments: [
        {
          name: 'Early Adopters',
          count: 1250,
          percentage: 27,
          growth: 12,
          characteristics: [
            'Tech-savvy',
            'First to try new products',
            'High engagement rate',
            'Share feedback actively',
          ],
        },
        {
          name: 'Value Seekers',
          count: 1580,
          percentage: 35,
          growth: 8,
          characteristics: [
            'Price-conscious',
            'Compare options thoroughly',
            'Long consideration period',
            'Look for deals and discounts',
          ],
        },
        {
          name: 'Brand Advocates',
          count: 980,
          percentage: 21,
          growth: 15,
          characteristics: [
            'Loyal to trusted brands',
            'Recommend to friends',
            'Participate in communities',
            'Share authentic reviews',
          ],
        },
        {
          name: 'Casual Browsers',
          count: 757,
          percentage: 17,
          growth: 3,
          characteristics: [
            'Occasional researchers',
            'Browse multiple campaigns',
            'Low conversion intent',
            'Interested but undecided',
          ],
        },
      ],
      demographics: {
        ageGroups: [
          { label: '18-24', value: 680 },
          { label: '25-34', value: 1420 },
          { label: '35-44', value: 1150 },
          { label: '45-54', value: 620 },
          { label: '55+', value: 97 },
        ],
        interests: [
          { label: 'Technology', value: 1200 },
          { label: 'Sustainability', value: 980 },
          { label: 'Health & Wellness', value: 820 },
          { label: 'Design', value: 750 },
          { label: 'Innovation', value: 680 },
          { label: 'Lifestyle', value: 537 },
        ],
        platforms: [
          { label: 'Web', value: 2850 },
          { label: 'Mobile App', value: 1250 },
          { label: 'Email', value: 320 },
          { label: 'Social Media', value: 147 },
        ],
      },
    }

    return NextResponse.json(simulatedData)
  } catch (error) {
    console.error('Error fetching audience insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audience insights' },
      { status: 500 }
    )
  }
}
