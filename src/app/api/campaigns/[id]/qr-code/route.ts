import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/qr-code
// ============================================================================
// Fetch QR code statistics: scan count and last scanned timestamp
// Uses ContributionEvent with eventType 'SOCIAL_SHARE' and metadata tracking

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Find campaign by ID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get QR code scan events from ContributionEvent
    // These are tracked with eventType 'SOCIAL_SHARE' and metadata.action='qr_code_scan'
    const qrScanEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'qr_code_scan',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    // Get total scan count
    const totalScans = await prisma.contributionEvent.count({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'qr_code_scan',
        },
      },
    })

    const lastScanEvent = qrScanEvents[0]

    return NextResponse.json({
      scans: totalScans,
      lastScanned: lastScanEvent?.createdAt || null,
      campaignId: campaign.id,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/qr-code]', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR code stats' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/campaigns/[id]/qr-code
// ============================================================================
// Log a QR code event (scan or share)
// Creates ContributionEvent with eventType 'SOCIAL_SHARE' and metadata

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()
    const { action = 'qr_code_scan' } = body

    // Find campaign by ID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get current user if authenticated
    const user = await getCurrentUser()

    // Only log event if user is authenticated
    if (user) {
      // Create contribution event for QR code interaction
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          eventType: 'SOCIAL_SHARE',
          points: action === 'qr_code_scan' ? 5 : 2, // Points for scans vs shares
          metadata: {
            action,
            source: 'qr_code',
            timestamp: new Date().toISOString(),
            userAgent: request.headers.get('user-agent') || undefined,
          },
        },
      })
    }

    // Get updated stats
    const totalScans = await prisma.contributionEvent.count({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'qr_code_scan',
        },
      },
    })

    const latestEvent = await prisma.contributionEvent.findFirst({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'qr_code_scan',
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    return NextResponse.json({
      success: true,
      scans: totalScans,
      lastScanned: latestEvent?.createdAt || null,
      authenticated: !!user,
    })
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/qr-code]', error)
    return NextResponse.json(
      { error: 'Failed to log QR code event' },
      { status: 500 }
    )
  }
}
