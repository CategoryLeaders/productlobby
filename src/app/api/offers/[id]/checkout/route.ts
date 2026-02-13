import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, requirePhoneVerification } from '@/lib/auth'
import { createOfferCheckout } from '@/lib/stripe'
import { CheckoutSchema } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/offers/[id]/checkout - Start checkout process
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Phone verification required for checkout
    try {
      await requirePhoneVerification(user.id)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Phone verification required for checkout' },
        { status: 403 }
      )
    }

    const { id: offerId } = await params

    // Check offer exists and is active
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        status: true,
        deadline: true,
        shippingRequired: true,
      },
    })

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    if (offer.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Offer is not active' },
        { status: 400 }
      )
    }

    if (offer.deadline < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Offer has expired' },
        { status: 400 }
      )
    }

    // Check if user already has a paid order
    const existingOrder = await prisma.order.findFirst({
      where: {
        offerId,
        userId: user.id,
        status: 'PAID',
      },
    })

    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: 'You have already ordered this offer' },
        { status: 409 }
      )
    }

    // Validate shipping details if required
    const body = await request.json()

    if (offer.shippingRequired) {
      const result = CheckoutSchema.safeParse(body)

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error.errors[0].message },
          { status: 400 }
        )
      }

      // Validate required shipping fields
      const { shippingName, shippingLine1, shippingCity, shippingPostcode, shippingCountry } = result.data

      if (!shippingName || !shippingLine1 || !shippingCity || !shippingPostcode || !shippingCountry) {
        return NextResponse.json(
          { success: false, error: 'Complete shipping address is required' },
          { status: 400 }
        )
      }
    }

    // Create Stripe checkout
    const checkout = await createOfferCheckout(
      offerId,
      user.id,
      offer.shippingRequired ? body : undefined
    )

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: checkout.clientSecret,
        paymentIntentId: checkout.paymentIntentId,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
