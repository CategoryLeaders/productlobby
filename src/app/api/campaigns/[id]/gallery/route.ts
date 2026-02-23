import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/gallery
// ============================================================================
// Returns all gallery images for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Fetch campaign with contribution events that have gallery images
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch gallery images stored in contribution events
    const galleryEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['type'],
          equals: 'gallery_image',
        },
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Extract images from metadata
    const images = galleryEvents
      .map((event) => {
        if (event.metadata && typeof event.metadata === 'object') {
          const metadata = event.metadata as any
          return {
            id: event.id,
            url: metadata.imageUrl as string,
            altText: (metadata.altText as string) || '',
            order: (metadata.order as number) || 0,
            createdAt: event.createdAt,
          }
        }
        return null
      })
      .filter((img) => img && img.url)

    // Sort by order
    images.sort((a, b) => (a?.order || 0) - (b?.order || 0))

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        images: images as any[],
        count: images.length,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/gallery]', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/gallery
// ============================================================================
// Add a new gallery image (creator only, max 10 images)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only campaign creator can add images' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { imageUrl, altText, order } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Count existing gallery images
    const existingCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['type'],
          equals: 'gallery_image',
        },
      },
    })

    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 gallery images allowed' },
        { status: 400 }
      )
    }

    // Create gallery image as a contribution event
    const event = await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0, // Gallery images don't earn points
        metadata: {
          type: 'gallery_image',
          imageUrl,
          altText: altText || '',
          order: order || existingCount,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        url: imageUrl,
        altText: altText || '',
        order: order || existingCount,
        createdAt: event.createdAt,
      },
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/gallery]', error)
    return NextResponse.json(
      { error: 'Failed to add gallery image' },
      { status: 500 }
    )
  }
}
