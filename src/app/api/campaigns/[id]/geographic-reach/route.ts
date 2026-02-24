export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface RegionData {
  name: string
  country: string
  supporters: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface GeographicData {
  totalCountries: number
  totalCities: number
  topRegions: RegionData[]
  reachScore: number
}

interface GeographicReachResponse {
  success: boolean
  data?: GeographicData
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GeographicReachResponse>> {
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

    // Check authorization
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simulated geographic data with 8 regions across UK, US, EU, APAC
    const topRegions: RegionData[] = [
      { name: 'London', country: 'UK', supporters: 2450, percentage: 22, trend: 'up' },
      { name: 'New York', country: 'USA', supporters: 2180, percentage: 19, trend: 'up' },
      { name: 'San Francisco', country: 'USA', supporters: 1890, percentage: 17, trend: 'stable' },
      { name: 'Berlin', country: 'Germany', supporters: 1540, percentage: 14, trend: 'up' },
      { name: 'Paris', country: 'France', supporters: 1210, percentage: 11, trend: 'stable' },
      { name: 'Singapore', country: 'Singapore', supporters: 980, percentage: 9, trend: 'up' },
      { name: 'Tokyo', country: 'Japan', supporters: 760, percentage: 7, trend: 'down' },
      { name: 'Sydney', country: 'Australia', supporters: 570, percentage: 5, trend: 'up' },
    ]

    const data: GeographicData = {
      totalCountries: 23,
      totalCities: 156,
      topRegions,
      reachScore: 72,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching geographic data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
