/**
 * Brand Campaign Analytics API
 * GET /api/brand/campaigns/[id]/analytics
 *
 * Returns aggregated, sanitized campaign data for brands.
 * Brands see lobby counts, intensity distributions, revenue projections.
 * Brands NEVER see individual user data (names, emails, profiles).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isBrandUser, sanitizeForBrand } from '@/lib/privacy'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/brand/campaigns/[id]/analytics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params

    // Fetch the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        targetedBrand: {
          select: { id: true, name: true },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user has brand access to this campaign
    if (!campaign.targetedBrand) {
      return NextResponse.json(
        { success: false, error: 'Campaign not associated with a brand' },
        { status: 404 }
      )
    }

    const hasAccess = await isBrandUser(user.id, campaign.targetedBrand.id)
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - you do not have access to this campaign' },
        { status: 403 }
      )
    }

    // Sanitize data for brand consumption
    const brandSafeData = await sanitizeForBrand(campaign)

    // Create response with privacy headers
    const response = NextResponse.json({
      success: true,
      data: brandSafeData,
    })

    // Add privacy headers
    response.headers.set('X-Privacy-Level', 'aggregated')
    response.headers.set('Cache-Control', 'private, max-age=300') // 5 minute cache

    return response
  } catch (error) {
    console.error('Brand campaign analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
