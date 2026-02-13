import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, createPhoneVerification } from '@/lib/auth'
import { sendPhoneVerificationSMS } from '@/lib/email'
import { PhoneVerificationSchema } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = PhoneVerificationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { phone } = result.data
    const code = await createPhoneVerification(user.id, phone)
    const smsResult = await sendPhoneVerificationSMS(phone, code)

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
    })
  } catch (error) {
    console.error('Phone send error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
