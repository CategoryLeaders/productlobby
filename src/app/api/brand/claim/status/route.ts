/**
 * Brand Verification Status API
 * GET /api/brand/claim/status
 *
 * Returns the current verification status for the authenticated user's brand(s)
 * Shows email verification, domain verification, and overall status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getBrandVerificationStatus } from '@/lib/brand-verification'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      )
    }

    // Get all brands where the user is a team member
    const brandMemberships = await prisma.brandTeam.findMany({
      where: { userId: user.id },
      include: {
        brand: {
          include: {
            verifications: true,
          },
        },
      },
    })

    if (brandMemberships.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'PENDING',
          emailVerified: false,
          domainVerified: false,
          nextSteps: ['Start verification process'],
        },
      })
    }

    // Get verification status for the user's primary brand
    // (In a real app, user might have multiple brands, would need to specify which one)
    const primaryBrand = brandMemberships[0].brand
    const verificationStatus = await getBrandVerificationStatus(primaryBrand.id)

    // Determine next steps based on current status
    let nextSteps: string[] = []

    if (verificationStatus.status === 'PENDING') {
      nextSteps = ['Verify your email address', 'Verify domain ownership', 'Submit claim for review']
    } else if (verificationStatus.status === 'EMAIL_VERIFIED') {
      nextSteps = ['Verify domain ownership', 'Submit claim for review']
    } else if (verificationStatus.status === 'DOMAIN_VERIFIED') {
      nextSteps = ['Verify your email address', 'Submit claim for review']
    } else if (verificationStatus.status === 'FULLY_VERIFIED') {
      nextSteps = ['Manage your brand', 'Respond to campaigns', 'View analytics']
    } else if (verificationStatus.status === 'REJECTED') {
      nextSteps = ['Review rejection reason', 'Retry verification']
    }

    return NextResponse.json({
      success: true,
      data: {
        ...verificationStatus,
        nextSteps,
        brandId: primaryBrand.id,
        brandName: primaryBrand.name,
      },
    })
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get verification status' },
      { status: 500 }
    )
  }
}
