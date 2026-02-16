import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

type SortType = 'name' | 'responsiveness'

// GET /api/brands - Search/list brands
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const sort = (searchParams.get('sort') || 'name') as SortType
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    let orderBy: any = { name: 'asc' }
    if (sort === 'responsiveness') {
      orderBy = { responsivenessScore: { sort: 'desc', nulls: 'last' } }
    }

    const brands = await prisma.brand.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      take: limit,
      orderBy,
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    })

    return NextResponse.json({
      brands,
      total: brands.length,
    })
  } catch (error) {
    console.error('[GET /api/brands]', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Create brand
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, website, description } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug
    let slug = slugify(name)

    // Ensure slug is unique
    const existing = await prisma.brand.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Create brand and add user as owner in transaction
    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        website: website || null,
        description: description || null,
        status: 'UNCLAIMED',
        team: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        team: {
          select: {
            userId: true,
            role: true,
          },
        },
        _count: {
          select: { campaigns: true },
        },
      },
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('[POST /api/brands]', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
