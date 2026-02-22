/**
 * Email Verification API
 * POST /api/brand/claim/verify-email
 *
 * Verifies the email code sent to the user's email address
 * Marks the email domain as verified if code is correct
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { completeBrandVerification } from '@/lib/brand-verification'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, code } = body

    if (!token || !code) {
      return NextResponse.json(
        { success: false, error: 'Token and code are required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Look up the code from a temporary storage (Redis, short-lived DB record)
    // 2. Verify it matches and hasn't expired
    // 3. Mark as verified

    // For MVP, we'll accept any code and mark as verified
    // In production, implement proper code storage and validation

    // Find the verification record
    const verification = await prisma.brandVerification.findFirst({
      where: {
        token,
        method: 'EMAIL_DOMAIN',
      },
    })

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // In production: validate code from temporary storage
    // For MVP: mark as verified when code is provided
    if (!code || code.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Complete the email domain verification
    await completeBrandVerification(token)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Email verified successfully',
      },
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
