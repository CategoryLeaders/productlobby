import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

// GET /api/campaigns/[id]/media
// Returns media/attachments for a campaign with attachment metadata
export async function GET(
  _request: NextRequest,
  props: { params: Params }
) {
  try {
    const { id } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Track media viewing as a contribution event
    const user = await getCurrentUser()
    if (user) {
      try {
        await prisma.contributionEvent.create({
          data: {
            userId: user.id,
            campaignId: id,
            eventType: 'SOCIAL_SHARE',
            metadata: {
              action: 'media_view',
              mediaCount: campaign.media.length,
            },
          },
        })
      } catch (error) {
        // Silently fail event tracking - don't block the response
        console.error('Failed to track media view event:', error)
      }
    }

    // Format media with extended metadata
    const formattedMedia = campaign.media.map((m: any) => ({
      id: m.id,
      url: m.url,
      kind: m.kind,
      altText: m.altText,
      order: m.order,
      createdAt: m.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedMedia,
      total: formattedMedia.length,
    })
  } catch (error) {
    console.error('GET /api/campaigns/[id]/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/media
// Add media/attachment to campaign
export async function POST(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { url, kind, altText, order } = body

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate kind enum
    const validKinds = ['IMAGE', 'VIDEO', 'SKETCH', 'MOCKUP']
    if (!validKinds.includes(kind)) {
      return NextResponse.json(
        { error: `Invalid kind. Must be one of: ${validKinds.join(', ')}` },
        { status: 400 }
      )
    }

    // Get max order for new item
    const lastMedia = await prisma.campaignMedia.findFirst({
      where: { campaignId: id },
      orderBy: { order: 'desc' },
    })

    const newOrder = order ?? (lastMedia ? lastMedia.order + 1 : 0)

    const media = await prisma.campaignMedia.create({
      data: {
        campaignId: id,
        kind: kind as any,
        url,
        altText,
        order: newOrder,
      },
    })

    // Track media upload as a contribution event
    try {
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId: id,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            action: 'media_upload',
            mediaKind: kind,
            mediaId: media.id,
          },
        },
      })
    } catch (error) {
      // Silently fail event tracking - media was still created
      console.error('Failed to track media upload event:', error)
    }

    return NextResponse.json(
      {
        success: true,
        data: media,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/campaigns/[id]/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
