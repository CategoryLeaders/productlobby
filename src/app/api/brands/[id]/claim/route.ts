import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { BrandClaimSchema } from '@/types'
import { nanoid } from 'nanoid'
import { Resend } from 'resend'
import dns from 'dns/promises'

const resend = new Resend(process.env.RESEND_API_KEY)

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/brands/[id]/claim - Start brand claim process
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

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: { status: true, website: true, name: true },
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

    const body = await request.json()
    const result = BrandClaimSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { method, email } = result.data
    const token = nanoid(32)

    if (method === 'EMAIL_DOMAIN') {
      if (!email) {
        return NextResponse.json(
          { success: false, error: 'Email is required for email verification' },
          { status: 400 }
        )
      }

      // Validate email domain matches brand website
      if (brand.website) {
        const brandDomain = new URL(brand.website).hostname.replace('www.', '')
        const emailDomain = email.split('@')[1]

        if (emailDomain !== brandDomain) {
          return NextResponse.json(
            { success: false, error: `Email must be from ${brandDomain}` },
            { status: 400 }
          )
        }
      }

      // Create verification record
      await prisma.brandVerification.create({
        data: {
          brandId: id,
          method: 'EMAIL_DOMAIN',
          token,
          status: 'PENDING',
        },
      })

      // Send verification email
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/brands/${id}/verify?token=${token}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'CrowdLobby <noreply@crowdlobby.com>',
        to: email,
        subject: `Verify your claim to ${brand.name} on CrowdLobby`,
        html: `
          <h2>Verify Brand Ownership</h2>
          <p>Click the link below to verify your claim to ${brand.name} on CrowdLobby:</p>
          <a href="${verifyUrl}">Verify Brand</a>
          <p>This link expires in 24 hours.</p>
        `,
      })

      return NextResponse.json({
        success: true,
        message: 'Verification email sent',
        data: { method: 'EMAIL_DOMAIN' },
      })
    } else if (method === 'DNS_TXT') {
      // Create verification record
      await prisma.brandVerification.create({
        data: {
          brandId: id,
          method: 'DNS_TXT',
          token,
          status: 'PENDING',
        },
      })

      // Get domain from website
      const domain = brand.website
        ? new URL(brand.website).hostname.replace('www.', '')
        : null

      return NextResponse.json({
        success: true,
        message: 'Add the following DNS TXT record',
        data: {
          method: 'DNS_TXT',
          domain,
          record: `crowdlobby-verify=${token}`,
          instructions: `Add a TXT record to ${domain} with value: crowdlobby-verify=${token}`,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid verification method' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Brand claim error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
