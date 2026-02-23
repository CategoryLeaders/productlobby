export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/campaigns/[id]/company-response - Get company response for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Get the campaign to ensure it exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        targetedBrandId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all company responses for this campaign, ordered by most recent first
    const responses = await prisma.brandResponse.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    // Get the most recent response status
    const latestResponse = responses[0] || null

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        responses,
        latestResponse,
        responseCount: responses.length,
      },
    })
  } catch (error) {
    console.error('Get company response error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/company-response - Log a company response (creator only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Get campaign to verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        targetedBrandId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { responseType, content, sourceUrl, brandId } = body

    // Validate response type
    const validTypes = [
      'acknowledged',
      'investigating',
      'committed',
      'declined',
      'no_response',
    ]
    if (!responseType || !validTypes.includes(responseType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response type. Must be one of: acknowledged, investigating, committed, declined, no_response',
        },
        { status: 400 }
      )
    }

    // Map response type to BrandResponseType
    const responseTypeMap: Record<string, any> = {
      acknowledged: 'STATUS_UPDATE',
      investigating: 'STATUS_UPDATE',
      committed: 'ANNOUNCEMENT',
      declined: 'COMMENT',
      no_response: 'COMMENT',
    }

    // Determine which brand to log the response for
    let useBrandId = brandId || campaign.targetedBrandId
    if (!useBrandId) {
      return NextResponse.json(
        { success: false, error: 'No brand specified and no target brand on campaign' },
        { status: 400 }
      )
    }

    // Verify brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: useBrandId },
      select: { id: true, name: true },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Create the brand response record
    const response = await prisma.brandResponse.create({
      data: {
        campaignId,
        brandId: useBrandId,
        authorUserId: user.id,
        content: content || `Company ${responseType}`,
        responseType: responseTypeMap[responseType],
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    })

    // Store metadata in contribution event if this is significant
    if (['committed', 'acknowledged'].includes(responseType)) {
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'BRAND_OUTREACH',
          points: responseType === 'committed' ? 50 : 20,
          metadata: {
            responseType,
            brandId: useBrandId,
            sourceUrl,
          },
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          response,
          responseType,
          brandName: brand.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Log company response error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
