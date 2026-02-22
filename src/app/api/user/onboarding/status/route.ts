import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/user/onboarding/status
 * Check if user needs to complete onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { needsOnboarding: false }
      )
    }

    // User needs onboarding if displayName is null, empty, default, or email-based
    const needsOnboarding =
      !user.displayName ||
      user.displayName === 'Alex Johnson' ||
      user.displayName.includes('@')

    return NextResponse.json({
      needsOnboarding,
      displayName: user.displayName,
    })
  } catch (error) {
    console.error('[GET /api/user/onboarding/status]', error)
    return NextResponse.json(
      { needsOnboarding: false },
      { status: 500 }
    )
  }
}
