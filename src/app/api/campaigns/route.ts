import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { CreateCampaignSchema, CampaignQuerySchema } from '@/types'
import { generateFingerprint, slugify } from '@/lib/utils'

// GET /api/campaigns - List campaigns with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = CampaignQuerySchema.parse({
      query: searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      brandId: searchParams.get('brandId') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || 'trending',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    })

    const where: any = {
      status: query.status || 'LIVE',
    }

    if (query.query) {
      where.OR = [
        { title: { contains: query.query, mode: 'insensitive' } },
        { description: { contains: query.query, mode: 'insensitive' } },
      ]
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.brandId) {
      where.targetedBrandId = query.brandId
    }

    const orderBy: any =
      query.sort === 'newest'
        ? { createdAt: 'desc' }
        : query.sort === 'signal'
        ? { signalScore: 'desc' }
        : [{ signalScore: 'desc' }, { createdAt: 'desc' }]

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              handle: true,
            },
          },
          targetedBrand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          media: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              lobbies: true,
              follows: true,
            },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ])

    // Add stats to each campaign based on lobby data
    const campaignsWithStats = campaigns.map((campaign: any) => {
      const lobbyCount = campaign._count?.lobbies || 0
      return {
        ...campaign,
        stats: {
          supportCount: lobbyCount,
          intentCount: 0,
          estimatedDemand: 0,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: campaignsWithStats,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('List campaigns error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = CreateCampaignSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Generate fingerprint for deduplication
    const fingerprint = generateFingerprint({
      brandId: data.targetedBrandId || undefined,
      template: data.template,
      keywords: data.title.toLowerCase().split(/\s+/).slice(0, 5),
    })

    // Check for similar campaigns
    const similarCampaigns = await prisma.campaign.findMany({
      where: {
        fingerprintHash: fingerprint,
        status: 'LIVE',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        _count: {
          select: { lobbies: true },
        },
      },
    })

    if (similarCampaigns.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Similar campaigns exist',
        data: {
          similarCampaigns,
        },
      }, { status: 409 })
    }

    // Create the campaign with media if provided
    const campaign = await prisma.campaign.create({
      data: {
        creatorUserId: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        template: data.template,
        targetedBrandId: data.targetedBrandId,
        openToAlternatives: data.openToAlternatives,
        currency: data.currency,
        fingerprintHash: fingerprint,
        status: 'LIVE',
        // Create media records if URLs provided
        ...(data.mediaUrls && data.mediaUrls.length > 0
          ? {
              media: {
                create: data.mediaUrls.map((url, index) => ({
                  kind: 'IMAGE' as const,
                  url,
                  order: index,
                })),
              },
            }
          : {}),
      },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: campaign,
    }, { status: 201 })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
