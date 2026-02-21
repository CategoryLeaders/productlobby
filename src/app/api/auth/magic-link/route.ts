import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'
import { MagicLinkSchema } from '@/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = MagicLinkSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data
    const token = await createMagicLink(email)

    // If Resend is configured, send the email normally
    if (process.env.RESEND_API_KEY) {
      const emailResult = await sendMagicLinkEmail(email, token)

      if (!emailResult.success) {
        return NextResponse.json(
          { success: false, error: 'Failed to send email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Check your email for the magic link',
      })
    }

    // No email provider configured — return the magic link directly
    // so the user can still sign in
    const magicLink = `${APP_URL}/verify?token=${token}`
    return NextResponse.json({
      success: true,
      mode: 'direct',
      magicLink,
      message: 'Email delivery is not configured yet. Use the link below to sign in.',
    })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
