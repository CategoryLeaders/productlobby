import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { completeOnboarding } from '@/lib/onboarding'

/**
 * POST /api/user/onboarding
 * Complete user onboarding by setting their name and optional product idea
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, productIdea } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Complete onboarding
    const result = await completeOnboarding(
      user.id,
      name.trim(),
      productIdea
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      campaignDraftId: result.campaignDraftId,
    })
  } catch (error) {
    console.error('[POST /api/user/onboarding]', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
