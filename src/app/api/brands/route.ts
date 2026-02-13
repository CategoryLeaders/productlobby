import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { CreateBrandSchema } from '@/types'
import { slugify } from '@/lib/utils'

// GET /api/brands - Search brands
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '20')

    const brands = await prisma.brand.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {},
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        status: true,
        _count: {
          select: { campaigns: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: brands,
    })
  } catch (error) {
    console.error('Search brands error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Create an unclaimed brand
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
    const result = CreateBrandSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, website } = result.data
    let slug = slugify(name)

    // Ensure slug is unique
    const existing = await prisma.brand.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        website,
        status: 'UNCLAIMED',
      },
    })

    return NextResponse.json({
      success: true,
      data: brand,
    }, { status: 201 })
  } catch (error) {
    console.error('Create brand error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
