import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getCategoryBreakdown } from '@/lib/analytics-engine'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const categories = await getCategoryBreakdown()

    return NextResponse.json({
      categories,
      total: categories.reduce((sum, cat) => sum + cat.campaigns, 0),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Categories analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
