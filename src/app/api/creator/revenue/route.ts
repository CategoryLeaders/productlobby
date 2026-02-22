import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { calculateCreatorEarnings, getRevenueBreakdown, getPayoutHistory, getCreatorRevenueStats } from '@/lib/creator-revenue'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = request.nextUrl.searchParams.get('stats')

    if (stats === 'true') {
      const revenueStats = await getCreatorRevenueStats(user.id)
      return NextResponse.json(revenueStats)
    }

    const [earnings, breakdown, payoutHistory] = await Promise.all([
      calculateCreatorEarnings(user.id),
      getRevenueBreakdown(user.id),
      getPayoutHistory(user.id),
    ])

    const formattedEarnings = {
      totalEarnings: earnings.totalEarnings.toString(),
      referralBonus: earnings.referralBonus.toString(),
      campaignSuccessFees: earnings.campaignSuccessFees.toString(),
      tipJarEarnings: earnings.tipJarEarnings.toString(),
      totalPaid: earnings.totalPaid.toString(),
      totalPending: earnings.totalPending.toString(),
      availableForPayout: earnings.availableForPayout.toString(),
    }

    const formattedBreakdown = breakdown.map((b) => ({
      ...b,
      amount: b.amount.toString(),
      createdAt: b.createdAt.toISOString(),
    }))

    const formattedHistory = payoutHistory.map((p) => ({
      ...p,
      amount: p.amount.toString(),
      requestedAt: p.requestedAt.toISOString(),
      processedAt: p.processedAt?.toISOString(),
      completedAt: p.completedAt?.toISOString(),
    }))

    return NextResponse.json({
      earnings: formattedEarnings,
      breakdown: formattedBreakdown,
      payoutHistory: formattedHistory,
    })
  } catch (error) {
    console.error('Error fetching creator revenue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
