import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/platform/stats - Fetch platform-wide statistics
export async function GET(request: NextRequest) {
  try {
    // Count total campaigns
    const totalCampaigns = await prisma.campaign.count({
      where: {
        status: {
          not: 'DRAFT',
        },
      },
    })

    // Count total active lobbies (users who pledged)
    const totalLobbies = await prisma.pledge.count()

    // Count total users
    const totalUsers = await prisma.user.count()

    // Count total comments
    const totalComments = await prisma.comment.count()

    // Count total shares
    const totalShares = await prisma.share.count()

    return NextResponse.json({
      success: true,
      data: {
        totalCampaigns,
        totalLobbies,
        totalUsers,
        totalComments,
        totalShares,
      },
    })
  } catch (error) {
    console.error('[GET /api/platform/stats]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch platform statistics',
      },
      { status: 500 }
    )
  }
}
