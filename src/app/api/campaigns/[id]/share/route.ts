import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { platform } = await request.json()

    if (!platform || typeof platform !== 'string') {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const user = await getCurrentUser()
    let referralUrl: string | undefined = undefined

    // Create share record
    let shareData: any = {
      campaignId: params.id,
      platform: platform.toUpperCase(),
    }

    // If user is authenticated, create a referral code
    if (user) {
      // Generate referral code (userId-campaignId hash, 8 chars)
      const hash = crypto
        .createHash('md5')
        .update(`${user.id}-${params.id}`)
        .digest('hex')
        .slice(0, 8)

      shareData.userId = user.id
      shareData.referralCode = hash

      // Check if share with this referral code already exists
      const existingShare = await prisma.share.findFirst({
        where: {
          userId: user.id,
          campaignId: params.id,
          platform: platform.toUpperCase(),
        },
      })

      // Only create a new share if one doesn't exist for this platform
      if (!existingShare) {
        await prisma.share.create({
          data: shareData,
        })
      }

      referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'}/r/${hash}`

      // Create contribution event for the user
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId: params.id,
          eventType: 'SOCIAL_SHARE',
          points: 10,
          metadata: {
            platform: platform.toUpperCase(),
          },
        },
      })
    } else {
      // Create share record without user
      await prisma.share.create({
        data: shareData,
      })
    }

    return NextResponse.json({
      success: true,
      referralUrl,
    })
  } catch (error) {
    console.error('Share tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    )
  }
}
