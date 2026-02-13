import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, verifyPhoneCode } from '@/lib/auth'
import { PhoneCodeSchema } from '@/types'

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
    const result = PhoneCodeSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { code } = result.data
    const verified = await verifyPhoneCode(user.id, code)

    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully',
    })
  } catch (error) {
    console.error('Phone verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
