import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    // Find share by referral code
    const share = await prisma.share.findUnique({
      where: { referralCode: params.code },
      select: {
        id: true,
        campaignId: true,
        campaign: {
          select: {
            slug: true,
          },
        },
      },
    })

    if (!share) {
      return NextResponse.json(
        { error: 'Referral link not found' },
        { status: 404 }
      )
    }

    // Increment click count
    await prisma.share.update({
      where: { id: share.id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    })

    // Redirect to campaign page with ref param
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'}/campaigns/${share.campaign.slug}?ref=${params.code}`

    return NextResponse.redirect(redirectUrl, 301)
  } catch (error) {
    console.error('Referral redirect error:', error)
    return NextResponse.json(
      { error: 'Failed to process referral link' },
      { status: 500 }
    )
  }
}
