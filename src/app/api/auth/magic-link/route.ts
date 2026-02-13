import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'
import { MagicLinkSchema } from '@/types'

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
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
