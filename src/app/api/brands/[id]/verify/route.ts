import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import dns from 'dns/promises'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/brands/[id]/verify - Complete brand verification
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { token, method } = body

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: { status: true, website: true },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Find pending verification
    const verification = await prisma.brandVerification.findFirst({
      where: {
        brandId: id,
        token,
        status: 'PENDING',
      },
    })

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - verification.createdAt.getTime()
    if (tokenAge > 24 * 60 * 60 * 1000) {
      await prisma.brandVerification.update({
        where: { id: verification.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        { success: false, error: 'Verification token expired' },
        { status: 400 }
      )
    }

    // For DNS verification, check the DNS record
    if (verification.method === 'DNS_TXT') {
      if (!brand.website) {
        return NextResponse.json(
          { success: false, error: 'Brand has no website configured' },
          { status: 400 }
        )
      }

      const domain = new URL(brand.website).hostname.replace('www.', '')

      try {
        const records = await dns.resolveTxt(domain)
        const expectedValue = `productlobby-verify=${token}`

        const found = records.some((recordArray) =>
          recordArray.some((record) => record === expectedValue)
        )

        if (!found) {
          return NextResponse.json(
            { success: false, error: 'DNS record not found. Please add the TXT record and try again.' },
            { status: 400 }
          )
        }
      } catch (dnsError) {
        console.error('DNS lookup error:', dnsError)
        return NextResponse.json(
          { success: false, error: 'Could not verify DNS record' },
          { status: 400 }
        )
      }
    }

    // Mark verification as complete
    await prisma.$transaction([
      prisma.brandVerification.update({
        where: { id: verification.id },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      }),
      prisma.brand.update({
        where: { id },
        data: { status: 'VERIFIED' },
      }),
      // Add user as brand owner
      prisma.brandTeam.upsert({
        where: {
          brandId_userId: {
            brandId: id,
            userId: user.id,
          },
        },
        create: {
          brandId: id,
          userId: user.id,
          role: 'OWNER',
        },
        update: {
          role: 'OWNER',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Brand verified successfully',
    })
  } catch (error) {
    console.error('Brand verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
