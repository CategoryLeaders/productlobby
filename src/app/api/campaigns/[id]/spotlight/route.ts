import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/campaigns/[id]/spotlight
 * Returns a featured supporter for the campaign based on activity level
 * Uses date-based seeding to rotate the featured supporter daily
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get top supporters with their contribution stats
    const supporters = await prisma.lobby.findMany({
      where: {
        campaignId,
        status: 'VERIFIED',
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Get top 100 supporters to choose from
    })

    if (supporters.length === 0) {
      return NextResponse.json(
        { error: 'No supporters found' },
        { status: 404 }
      )
    }

    // Generate seed based on current date for daily rotation
    const today = new Date()
    const dateString = today.toISOString().split('T')[0] // YYYY-MM-DD
    const seed = dateString
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Use seed to select a featured supporter (deterministic by day)
    const featuredIndex = seed % supporters.length
    const featuredSupporter = supporters[featuredIndex]

    // Count contributions for the featured supporter
    const lobbiesCount = await prisma.lobby.count({
      where: {
        userId: featuredSupporter.userId,
      },
    })

    // Count shares for the featured supporter (if available in schema)
    let sharesCount = 0
    try {
      sharesCount = await prisma.share.count({
        where: {
          userId: featuredSupporter.userId,
        },
      })
    } catch {
      // Share model might not exist, use 0
      sharesCount = 0
    }

    // Calculate days active (from first lobby to today)
    const daysActive = Math.floor(
      (today.getTime() - new Date(featuredSupporter.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Default inspirational message (could be extended to load from metadata in future)
    const inspirationalMessage =
      "I believe in the power of community feedback to drive real product innovation. Every lobby is a voice that matters!"

    return NextResponse.json({
      id: featuredSupporter.id,
      userId: featuredSupporter.userId,
      user: featuredSupporter.user,
      contributionStats: {
        lobbiesCount,
        sharesCount,
        daysActive: Math.max(daysActive, 0), // Ensure non-negative
      },
      metadata: {
        inspirationalMessage,
      },
    })
  } catch (error) {
    console.error('Error fetching spotlight supporter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spotlight supporter' },
      { status: 500 }
    )
  }
}
