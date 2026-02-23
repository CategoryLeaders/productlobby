import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')

  const where: any = {
    brandResponses: {
      some: {}
    }
  }
  if (category && category !== 'all') {
    where.category = category
  }

  const [stories, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: {
        creator: { select: { id: true, displayName: true, handle: true, avatar: true } },
        targetedBrand: { select: { id: true, name: true, slug: true, logo: true } },
        brandResponses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: { select: { lobbies: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.campaign.count({ where })
  ])

  return NextResponse.json({
    stories: stories.map(s => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      category: s.category,
      creator: s.creator,
      brand: s.targetedBrand,
      brandResponse: s.brandResponses[0] || null,
      lobbyCount: s._count.lobbies,
      commentCount: s._count.comments,
      createdAt: s.createdAt
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  })
}
