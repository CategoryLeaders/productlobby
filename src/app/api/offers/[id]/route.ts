import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/offers/[id] - Get offer details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            status: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Calculate progress
    const progress = Math.round((offer._count.orders / offer.goalQuantity) * 100)
    const remaining = Math.max(0, offer.goalQuantity - offer._count.orders)

    // Check if user has ordered
    const user = await getCurrentUser()
    let userOrder = null

    if (user) {
      userOrder = await prisma.order.findFirst({
        where: {
          offerId: id,
          userId: user.id,
          status: 'PAID',
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...offer,
        progress,
        remaining,
        orderCount: offer._count.orders,
        userOrder,
      },
    })
  } catch (error) {
    console.error('Get offer error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
