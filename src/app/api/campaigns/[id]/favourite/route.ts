import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ============================================================================
// POST: Toggle favourite (add if not exists, remove if exists)
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if favourite already exists
    const existingFavourite = await prisma.favourite.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId,
        },
      },
    })

    let favourited = false

    if (existingFavourite) {
      // Remove favourite
      await prisma.favourite.delete({
        where: {
          userId_campaignId: {
            userId: user.id,
            campaignId,
          },
        },
      })
      favourited = false
    } else {
      // Add favourite
      await prisma.favourite.create({
        data: {
          userId: user.id,
          campaignId,
        },
      })
      favourited = true
    }

    // Get current count
    const count = await prisma.favourite.count({
      where: { campaignId },
    })

    return NextResponse.json({
      success: true,
      data: {
        favourited,
        count,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Toggle favourite error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: Check if current user has favourited this campaign
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get current user (may be null for unauthenticated users)
    const user = await getCurrentUser()

    let favourited = false

    if (user) {
      const favourite = await prisma.favourite.findUnique({
        where: {
          userId_campaignId: {
            userId: user.id,
            campaignId,
          },
        },
      })
      favourited = !!favourite
    }

    // Get total count
    const count = await prisma.favourite.count({
      where: { campaignId },
    })

    return NextResponse.json({
      success: true,
      data: {
        favourited,
        count,
      },
    })
  } catch (error) {
    console.error('Get favourite error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
