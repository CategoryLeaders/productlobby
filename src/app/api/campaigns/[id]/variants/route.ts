import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface VariantPayload {
  description: string
}

// GET /api/campaigns/[id]/variants - Get description variants with metrics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
        description: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get campaign variants (stored in the name field)
    const variants = await prisma.campaignVariant.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    })

    // Get view/engagement metrics for each variant from contribution events
    const variantsWithMetrics = await Promise.all(
      variants.map(async (variant) => {
        // Count views (could be tracked via custom event or engagement)
        const views = Math.floor(Math.random() * 50) + 5 // Mock data
        const engagement = Math.floor(Math.random() * 10) + 1 // Mock data

        return {
          id: variant.id,
          description: variant.name, // name field stores description
          order: variant.order,
          createdAt: variant.createdAt,
          metrics: {
            views,
            engagement,
            conversionRate: views > 0 ? ((engagement / views) * 100).toFixed(2) + '%' : '0%',
          },
        }
      })
    )

    // Include the primary description as variant 0
    const allVariants = [
      {
        id: 'primary',
        description: campaign.description,
        order: 0,
        isPrimary: true,
        createdAt: campaign.id,
        metrics: {
          views: Math.floor(Math.random() * 100) + 50,
          engagement: Math.floor(Math.random() * 20) + 5,
          conversionRate: ((Math.random() * 0.3) * 100).toFixed(2) + '%',
        },
      },
      ...variantsWithMetrics,
    ]

    return NextResponse.json({
      success: true,
      data: allVariants,
    })
  } catch (error) {
    console.error('Get variants error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/variants - Add variant (creator only, max 3)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = await params

    // Get campaign and verify user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        creatorUserId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only campaign creator can add variants' },
        { status: 403 }
      )
    }

    // Check existing variant count
    const existingCount = await prisma.campaignVariant.count({
      where: { campaignId },
    })

    if (existingCount >= 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum 3 variants allowed' },
        { status: 400 }
      )
    }

    // Parse request
    const body: VariantPayload = await request.json()

    if (!body.description || body.description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    if (body.description.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Description must be at least 20 characters' },
        { status: 400 }
      )
    }

    if (body.description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Description must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Create variant
    const variant = await prisma.campaignVariant.create({
      data: {
        campaignId,
        name: body.description.trim(),
        order: existingCount + 1,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: variant.id,
          description: variant.name,
          order: variant.order,
          createdAt: variant.createdAt,
          metrics: {
            views: 0,
            engagement: 0,
            conversionRate: '0%',
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create variant error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
