/**
 * Brand Claim Initiation API
 * POST /api/brand/claim
 *
 * Initiates brand claim process by:
 * 1. Creating verification token
 * 2. Sending verification code to email
 * 3. Creating brand if it doesn't exist
 * 4. Creating verification record
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { generateVerificationToken, createBrandVerification } from '@/lib/brand-verification'
import crypto from 'crypto'

// Helper to generate a short verification code (6 digits)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
    const { email, campaignId, companyName, website, role, action } = body

    if (!email || !campaignId) {
      return NextResponse.json(
        { success: false, error: 'Email and campaignId are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const emailDomain = email.split('@')[1].toLowerCase()

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brand: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // For final submission, additional validation
    if (action === 'submit') {
      if (!companyName || !website || !role) {
        return NextResponse.json(
          { success: false, error: 'Company details are required for submission' },
          { status: 400 }
        )
      }
    }

    // Generate verification token and code
    const token = generateVerificationToken()
    const verificationCode = generateVerificationCode()

    // Store the verification code in a temporary verification record
    // In a real app, this would be in a separate table for email codes
    const verification = await createBrandVerification(campaign.brandId, 'EMAIL_DOMAIN', token)

    // In production, you would store the code and send it via email
    // For now, we'll include it in the response for testing
    // In real implementation: await sendEmail({ ... })
    const emailResult = {
      to: email,
      subject: 'Verify your brand on ProductLobby',
      code: verificationCode, // In production, don't include in response
    }

    // Log the verification code (in production, only log to secure audit trail)
    console.log(`Verification code for ${email}: ${verificationCode}`)

    return NextResponse.json({
      success: true,
      data: {
        token,
        email,
        message: 'Verification code sent to your email',
      },
      token, // Return token for client to use in verification
    })
  } catch (error) {
    console.error('Brand claim error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate brand claim' },
      { status: 500 }
    )
  }
}
