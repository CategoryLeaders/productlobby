import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = Promise<{ id: string }>

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

    return NextResponse.json({
      success: true,
      data: campaign.media,
    })
  } catch (error) {
    console.error('GET /api/campaigns/[id]/media error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { url, type, caption, order } = body

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate type enum
    const validTypes = ['IMAGE', 'VIDEO', 'SKETCH', 'MOCKUP']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
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
        kind: type as any,
        url,
        altText: caption,
        order: newOrder,
      },
    })

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
