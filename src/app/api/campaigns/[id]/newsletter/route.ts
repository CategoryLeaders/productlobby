export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/campaigns/[id]/newsletter - Get newsletter subscriber count
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Count newsletter subscriptions stored as contribution events
    const subscriberCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'newsletter_signup',
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        subscriberCount,
      },
    })
  } catch (error) {
    console.error('Get newsletter count error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/newsletter - Subscribe email to campaign updates
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const user = await getCurrentUser()

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { success: false, error: 'Valid email address required' },
        { status: 400 }
      )
    }

    // If user is logged in, use their ID; otherwise use a guest identifier
    const userId = user?.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for newsletter signup' },
        { status: 401 }
      )
    }

    // Create a contribution event for the newsletter signup
    // Store email in metadata for reference
    const event = await prisma.contributionEvent.create({
      data: {
        userId,
        campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'newsletter_signup',
          email,
          subscribedAt: new Date().toISOString(),
        },
      },
    })

    // Get updated subscriber count
    const subscriberCount = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'newsletter_signup',
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          campaignId,
          email,
          subscribed: true,
          subscriberCount,
          message: 'Successfully subscribed to campaign updates',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter signup error:', error)

    // Check if it's a duplicate subscription
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { success: false, error: 'You are already subscribed to this campaign' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
