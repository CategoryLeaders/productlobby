import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      )
    }

    // Check if handle exists
    const existingUser = await prisma.user.findFirst({
      where: { handle },
    })

    return NextResponse.json({
      available: !existingUser,
      handle,
    })
  } catch (error) {
    console.error('Error checking handle availability:', error)
    return NextResponse.json(
      { error: 'Failed to check handle availability' },
      { status: 500 }
    )
  }
}
