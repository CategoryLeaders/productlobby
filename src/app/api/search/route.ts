import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface SearchResult {
  campaigns: Array<{
    id: string
    title: string
    slug: string
    description: string | null
    category: string | null
    creator: {
      id: string
      displayName: string
      handle: string | null
      avatar: string | null
    }
    targetedBrand: {
      id: string
      name: string
      slug: string
      logo: string | null
    } | null
    lobbyCount: number
  }>
  brands: Array<{
    id: string
    name: string
    slug: string
    logo: string | null
    campaignCount: number
  }>
  creators: Array<{
    id: string
    displayName: string
    handle: string | null
    avatar: string | null
    bio: string | null
    campaignCount: number
  }>
}

// GET /api/search - Unified search across campaigns, brands, and creators
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    // Normalize search query
    const searchTerm = q.trim()

    if (!searchTerm || searchTerm.length < 1) {
      return NextResponse.json<SearchResult>({
        campaigns: [],
        brands: [],
        creators: [],
      })
    }

    // Search campaigns (title, description, category)
    const [campaigns, brands, creators] = await Promise.all([
      prisma.campaign.findMany({
        where: {
          status: 'LIVE',
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { category: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: true,
          creator: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatar: true,
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
          _count: {
            select: {
              lobbies: true,
            },
          },
        },
        orderBy: [
          { signalScore: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      }),

      // Search brands (name)
      prisma.brand.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
      }),

      // Search creators/users (displayName, handle)
      prisma.user.findMany({
        where: {
          OR: [
            { displayName: { contains: searchTerm, mode: 'insensitive' } },
            { handle: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatar: true,
          bio: true,
          _count: {
            select: {
              campaigns: true,
            },
          },
        },
        orderBy: { displayName: 'asc' },
        take: limit,
      }),
    ])

    // Format results
    const formattedCampaigns = campaigns.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description,
      category: campaign.category,
      creator: campaign.creator,
      targetedBrand: campaign.targetedBrand,
      lobbyCount: campaign._count?.lobbies || 0,
    }))

    const formattedBrands = brands.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      campaignCount: brand._count?.campaigns || 0,
    }))

    const formattedCreators = creators.map((creator: any) => ({
      id: creator.id,
      displayName: creator.displayName,
      handle: creator.handle,
      avatar: creator.avatar,
      bio: creator.bio,
      campaignCount: creator._count?.campaigns || 0,
    }))

    const result: SearchResult = {
      campaigns: formattedCampaigns,
      brands: formattedBrands,
      creators: formattedCreators,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/search]', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
