import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkUserAchievements, getEarnedBadges } from '@/lib/badges/achievement-engine'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params

    if (!handle) {
      return NextResponse.json(
        { success: false, error: 'Handle is required' },
        { status: 400 }
      )
    }

    // Fetch user by handle
    const user = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get earned badges only for public view
    const earnedBadges = await getEarnedBadges(user.id)

    return NextResponse.json({
      success: true,
      data: earnedBadges
    })
  } catch (error) {
    console.error('Error fetching user badges:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
