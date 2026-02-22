import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getOutreachCampaigns } from '@/lib/brand-outreach'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const opportunities = await getOutreachCampaigns()

    const stats = await prisma.outreachQueue.groupBy({
      by: ['status'],
      _count: true,
    })

    const recentQueue = await prisma.outreachQueue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        campaignId: true,
        brandEmail: true,
        brandName: true,
        subject: true,
        status: true,
        sentAt: true,
        openedAt: true,
        respondedAt: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({
      opportunities: opportunities.slice(0, 10),
      queue: recentQueue,
      stats: {
        total: stats.reduce((sum, s) => sum + s._count, 0),
        pending: stats.find((s) => s.status === 'PENDING')?._count ?? 0,
        sent: stats.find((s) => s.status === 'SENT')?._count ?? 0,
        opened: stats.find((s) => s.status === 'OPENED')?._count ?? 0,
        responded: stats.find((s) => s.status === 'RESPONDED')?._count ?? 0,
        failed: stats.find((s) => s.status === 'FAILED')?._count ?? 0,
      },
    })
  } catch (error) {
    console.error('Outreach list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach campaigns' },
      { status: 500 }
    )
  }
}
