import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/related - Get related campaigns in same category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
      select: {
        id: true,
        category: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Find related campaigns in the same category
    const relatedCampaigns = await prisma.campaign.findMany({
      where: {
        category: campaign.category,
        id: {
          not: campaign.id, // Exclude current campaign
        },
        status: 'LIVE',
      },
      orderBy: [
        {
          lobbies: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: 6,
      include: {
        media: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            lobbies: true,
          },
        },
      },
    })

    const formattedCampaigns = relatedCampaigns.map((c: any) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      status: c.status,
      image: c.media[0]?.url || null,
      lobbyCount: c._count.lobbies,
      description: c.description?.substring(0, 120) || '',
    }))

    return NextResponse.json({
      success: true,
      data: formattedCampaigns,
      total: formattedCampaigns.length,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/related]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch related campaigns' },
      { status: 500 }
    )
  }
}
