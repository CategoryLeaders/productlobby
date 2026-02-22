import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { calculateConversionFunnel } from '@/lib/conversion-analytics'

/**
 * GET /api/campaigns/[id]/conversions
 * Returns conversion funnel analytics for a specific campaign
 * Requires: User must be campaign creator or brand team member
 */
export async function GET(
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

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: { select: { id: true } },
        targetedBrand: {
          include: {
            team: {
              where: { userId: user.id },
            },
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check authorization: creator or brand team member
    const isCreator = campaign.creator.id === user.id
    const isBrandMember =
      campaign.targetedBrand && campaign.targetedBrand.team.length > 0

    if (!isCreator && !isBrandMember) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate conversion funnel
    const conversionData = await calculateConversionFunnel(campaignId)

    return NextResponse.json({
      success: true,
      data: conversionData,
    })
  } catch (error) {
    console.error('Get campaign conversions error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
