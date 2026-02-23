import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { checkUserAchievements } from '@/lib/badges/achievement-engine'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const achievements = await checkUserAchievements(user.id)

    return NextResponse.json({
      success: true,
      data: achievements
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
