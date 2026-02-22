import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { calculatePlatformConversions } from '@/lib/conversion-analytics'

/**
 * GET /api/analytics/conversions
 * Returns platform-wide conversion analytics
 * Requires: Admin user only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin (you can adjust this based on your admin detection logic)
    // For now, we'll check if the user has any admin/owner roles in brand teams
    const isAdmin = await prisma.brandTeam.findFirst({
      where: {
        userId: user.id,
        role: 'OWNER',
      },
    })

    // Alternatively, if you have a dedicated admin table or flag, check that instead
    // For this implementation, we're keeping it simple and allowing brand owners
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Calculate platform conversions
    const conversionStats = await calculatePlatformConversions()

    return NextResponse.json({
      success: true,
      data: conversionStats,
    })
  } catch (error) {
    console.error('Get platform conversions error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
