import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { scheduleOutreach } from '@/lib/brand-outreach'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { campaignId, brandEmail, brandName } = await request.json()

    if (!campaignId || !brandEmail || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, brandEmail, brandName' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, slug: true, status: true },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Campaign must be LIVE to send outreach' },
        { status: 400 }
      )
    }

    await scheduleOutreach(campaignId, brandEmail, brandName, campaign.slug)

    return NextResponse.json({
      success: true,
      message: `Outreach scheduled for ${brandName}`,
    })
  } catch (error) {
    console.error('Send outreach error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule outreach' },
      { status: 500 }
    )
  }
}
