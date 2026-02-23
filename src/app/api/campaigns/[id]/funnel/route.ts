import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface FunnelStage {
  id: string
  name: string
  count: number
  conversionRate?: number
  dropOffPercentage?: number
  order: number
}

interface FunnelData {
  stages: FunnelStage[]
  overallConversionRate: number
  createdAt?: string
  updatedAt?: string
}

/**
 * GET /api/campaigns/[id]/funnel
 * Retrieve funnel data for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        metadata: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Extract funnel data from metadata or return default
    const metadata = campaign.metadata as any || {}
    let funnelData: FunnelData = metadata.funnel || {
      stages: [
        { id: '1', name: 'Awareness', count: 1000, order: 0 },
        { id: '2', name: 'Interest', count: 750, order: 1 },
        { id: '3', name: 'Consideration', count: 500, order: 2 },
        { id: '4', name: 'Action', count: 250, order: 3 },
        { id: '5', name: 'Advocacy', count: 100, order: 4 },
      ],
      overallConversionRate: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(funnelData)
  } catch (error) {
    console.error('Funnel GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve funnel data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/funnel
 * Save or update funnel data for a campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let funnelData: FunnelData
    try {
      funnelData = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate funnel data
    if (!funnelData.stages || !Array.isArray(funnelData.stages)) {
      return NextResponse.json(
        { error: 'Stages must be an array' },
        { status: 400 }
      )
    }

    if (funnelData.stages.length === 0) {
      return NextResponse.json(
        { error: 'At least one stage is required' },
        { status: 400 }
      )
    }

    // Validate each stage
    for (const stage of funnelData.stages) {
      if (!stage.name || typeof stage.name !== 'string') {
        return NextResponse.json(
          { error: 'Each stage must have a valid name' },
          { status: 400 }
        )
      }
      if (typeof stage.count !== 'number' || stage.count < 0) {
        return NextResponse.json(
          { error: 'Each stage must have a valid count' },
          { status: 400 }
        )
      }
    }

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        metadata: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (campaign.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Add timestamps
    funnelData.createdAt = campaign.metadata?.funnel?.createdAt || new Date().toISOString()
    funnelData.updatedAt = new Date().toISOString()

    // Update campaign metadata with funnel data
    const metadata = campaign.metadata as any || {}
    metadata.funnel = funnelData

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        metadata,
      },
    })

    // Log the contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: id,
        eventType: 'SOCIAL_SHARE',
        points: 10,
        metadata: {
          action: 'funnel_builder_update',
          stageCount: funnelData.stages.length,
          overallConversionRate: funnelData.overallConversionRate,
        },
      },
    })

    return NextResponse.json(funnelData, { status: 200 })
  } catch (error) {
    console.error('Funnel POST error:', error)
    return NextResponse.json(
      { error: 'Failed to save funnel data' },
      { status: 500 }
    )
  }
}
