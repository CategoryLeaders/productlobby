import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all shares for this campaign grouped by platform
    const shares = await prisma.share.findMany({
      where: { campaignId: params.id },
      select: {
        platform: true,
        clickCount: true,
      },
    })

    // Calculate totals
    const total = shares.length
    const byPlatform: Record<string, number> = {}

    shares.forEach((share) => {
      byPlatform[share.platform] = (byPlatform[share.platform] || 0) + 1
    })

    return NextResponse.json({
      total,
      byPlatform,
    })
  } catch (error) {
    console.error('Share stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share stats' },
      { status: 500 }
    )
  }
}
