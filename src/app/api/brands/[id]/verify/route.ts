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
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: { id: true, slug: true, status: true, website: true, name: true },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    if (brand.status === 'VERIFIED') {
      return NextResponse.json(
        { success: false, error: 'Brand is already verified' },
        { status: 400 }
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
        { success: false, error: 'Invalid or expired verification token' },
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
        { success: false, error: 'Verification token has expired. Please start a new claim.' },
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
          { success: false, error: 'Could not verify DNS record. Please check your DNS configuration.' },
          { status: 400 }
        )
      }
    }

    // Mark verification as complete and brand as VERIFIED
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
      // Add user as brand OWNER
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
      message: 'Brand verified successfully! You are now the brand owner.',
      data: {
        brandId: brand.id,
        brandSlug: brand.slug,
        brandName: brand.name,
        status: 'VERIFIED',
      },
    })
  } catch (error) {
    console.error('Brand verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// GET /api/brands/[id]/verify - Check verification status (for the verify page)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, status: true },
    })

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // If token provided, check its status
    if (token) {
      const verification = await prisma.brandVerification.findFirst({
        where: { brandId: id, token },
      })

      return NextResponse.json({
        success: true,
        data: {
          brand: { id: brand.id, name: brand.name, slug: brand.slug },
          status: brand.status,
          verification: verification
            ? {
                status: verification.status,
                method: verification.method,
                createdAt: verification.createdAt,
                verifiedAt: verification.verifiedAt,
              }
            : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        brand: { id: brand.id, name: brand.name, slug: brand.slug },
        status: brand.status,
      },
    })
  } catch (error) {
    console.error('Brand verify status error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
