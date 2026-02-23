import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ShortLinksParams {
  params: {
    id: string
  }
}

// Utility function to generate a random short code
function generateShortCode(length: number = 6): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return code
}

// Utility function to ensure unique code
async function generateUniqueCode(): Promise<string> {
  let code = generateShortCode()
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const existing = await prisma.referralLink.findUnique({
      where: { code },
    })
    if (!existing) {
      return code
    }
    code = generateShortCode()
    attempts++
  }

  throw new Error('Failed to generate unique short code')
}

// GET /api/campaigns/[id]/short-links - List short links for a campaign
export async function GET(request: NextRequest, { params }: ShortLinksParams) {
  try {
    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const shortLinks = await prisma.referralLink.findMany({
      where: {
        campaignId: campaign.id,
      },
      select: {
        id: true,
        code: true,
        clickCount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      links: shortLinks,
    })
  } catch (error) {
    console.error('[GET /short-links]', error)
    return NextResponse.json(
      { error: 'Failed to fetch short links' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/short-links - Generate a new short link
export async function POST(request: NextRequest, { params }: ShortLinksParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
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
        { error: 'Only campaign creator can generate short links' },
        { status: 403 }
      )
    }

    // Generate unique short code
    const code = await generateUniqueCode()

    // Create the short link
    const shortLink = await prisma.referralLink.create({
      data: {
        code,
        campaignId: campaign.id,
        userId: user.id,
      },
      select: {
        id: true,
        code: true,
        clickCount: true,
        createdAt: true,
      },
    })

    // Record contribution event for creating the short link
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'short_link',
          code: code,
        },
      },
    })

    return NextResponse.json({
      link: shortLink,
    })
  } catch (error) {
    console.error('[POST /short-links]', error)
    return NextResponse.json(
      { error: 'Failed to generate short link' },
      { status: 500 }
    )
  }
}
