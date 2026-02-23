import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, slug: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get the caller's referral link for this campaign
    const user = await getCurrentUser()

    if (!user) {
      // Return a generic invite link without tracking code
      const baseUrl = request.headers.get('origin') || 'https://productlobby.com'
      return NextResponse.json({
        inviteLink: `${baseUrl}/campaigns/${campaign.slug}`,
        trackingCode: null,
        totalInvitesSent: 0,
        referralStats: null,
      })
    }

    // Get or create referral link for the user
    let referralLink = await prisma.referralLink.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId: campaignId,
        },
      },
    })

    if (!referralLink) {
      // Generate unique code
      const code = `ref_${user.id.substring(0, 8)}_${campaignId.substring(0, 8)}_${Date.now().toString(36)}`
      referralLink = await prisma.referralLink.create({
        data: {
          userId: user.id,
          campaignId: campaignId,
          code,
        },
      })
    }

    // Build invite link
    const baseUrl = request.headers.get('origin') || 'https://productlobby.com'
    const inviteLink = `${baseUrl}/campaigns/${campaign.slug}?ref=${referralLink.code}`

    // Get referral stats
    const referralStats = {
      clickCount: referralLink.clickCount,
      signupCount: referralLink.signupCount,
      conversionRate: referralLink.clickCount > 0
        ? ((referralLink.signupCount / referralLink.clickCount) * 100).toFixed(2)
        : '0.00',
    }

    return NextResponse.json({
      inviteLink,
      trackingCode: referralLink.code,
      totalInvitesSent: referralLink.signupCount,
      referralStats,
    })
  } catch (error) {
    console.error('Error getting invite link:', error)
    return NextResponse.json(
      { error: 'Failed to get invite link' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Verify campaign exists and user is creator or contributor
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, slug: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Delete existing referral link and create a new one
    await prisma.referralLink.deleteMany({
      where: {
        userId: user.id,
        campaignId: campaignId,
      },
    })

    // Generate new unique code
    const code = `ref_${user.id.substring(0, 8)}_${campaignId.substring(0, 8)}_${Date.now().toString(36)}`
    const referralLink = await prisma.referralLink.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        code,
      },
    })

    // Record the invite link generation as a contribution event
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 5,
        metadata: {
          action: 'invite_link',
          code: referralLink.code,
        },
      },
    })

    // Build invite link
    const baseUrl = request.headers.get('origin') || 'https://productlobby.com'
    const inviteLink = `${baseUrl}/campaigns/${campaign.slug}?ref=${referralLink.code}`

    return NextResponse.json({
      inviteLink,
      trackingCode: referralLink.code,
      message: 'New invite link generated successfully',
    })
  } catch (error) {
    console.error('Error generating invite link:', error)
    return NextResponse.json(
      { error: 'Failed to generate invite link' },
      { status: 500 }
    )
  }
}
