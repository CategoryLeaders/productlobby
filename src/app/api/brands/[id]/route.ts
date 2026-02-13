import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/brands/[id] - Get brand details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        campaigns: {
          where: { status: 'LIVE' },
          take: 10,
          orderBy: { signalScore: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            signalScore: true,
            _count: {
              select: { pledges: true },
            },
          },
        },
        offers: {
          where: { status: { in: ['ACTIVE', 'SUCCESSFUL'] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            deadline: true,
            _count: {
              select: { orders: true },
            },
          },
        },
        responses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            campaigns: true,
            offers: true,
            responses: true,
          },
        },
      },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    console.error('Get brand error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
