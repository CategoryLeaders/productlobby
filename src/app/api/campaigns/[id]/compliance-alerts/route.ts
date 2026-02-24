import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/compliance-alerts - Fetch compliance alerts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Simulated compliance alerts
    const alerts = [
      {
        id: 'alert-1',
        type: 'gdpr',
        severity: 'critical',
        title: 'GDPR Data Processing Agreement Required',
        description:
          'Campaign collects personal data from EU residents. A Data Processing Agreement must be in place.',
        recommendation:
          'Create and execute a DPA with data processors. Ensure consent mechanisms are GDPR-compliant.',
        status: 'open',
        regulation: 'GDPR',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-2',
        type: 'advertising',
        severity: 'warning',
        title: 'ASA Code Compliance Check',
        description:
          'Campaign marketing claims should be substantiated and not misleading.',
        recommendation:
          'Review all claims for accuracy. Maintain evidence of substantiation for at least 2 years.',
        status: 'acknowledged',
        regulation: 'ASA Code',
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-3',
        type: 'financial',
        severity: 'critical',
        title: 'FCA Financial Promotion Rules',
        description:
          'Campaign may involve financial promotions requiring FCA approval.',
        recommendation:
          'Obtain FCA approval before publishing. Include required risk warnings.',
        status: 'open',
        regulation: 'FCA COBS',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'alert-4',
        type: 'content',
        severity: 'warning',
        title: 'Copyright and IP Compliance',
        description: 'Ensure all content used has proper licensing or permissions.',
        recommendation:
          'Verify all images, videos, and text have appropriate rights. Use licensed content.',
        status: 'resolved',
        regulation: 'Copyright Law',
      },
      {
        id: 'alert-5',
        type: 'accessibility',
        severity: 'info',
        title: 'WCAG 2.1 AA Accessibility Standards',
        description:
          'Campaign materials should meet accessibility standards for all users.',
        recommendation:
          'Add alt text to images, ensure color contrast ratios, provide captions for videos.',
        status: 'acknowledged',
        regulation: 'WCAG 2.1',
      },
      {
        id: 'alert-6',
        type: 'gdpr',
        severity: 'warning',
        title: 'Cookie Consent Policy',
        description:
          'Campaign tracking may require explicit cookie consent from users.',
        recommendation:
          'Implement a cookie consent banner. Document all tracking purposes clearly.',
        status: 'open',
        regulation: 'GDPR',
      },
    ]

    return NextResponse.json({ alerts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching compliance alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance alerts' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/[id]/compliance-alerts - Update alert status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: campaignId } = params
    const body = await request.json()
    const { alertId, status } = body

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'Alert ID and status are required' },
        { status: 400 }
      )
    }

    if (!['open', 'acknowledged', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Record compliance action
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId,
        eventType: 'CONTRIBUTION',
        points: 0,
        metadata: {
          action: 'compliance_alert_update',
          alertId,
          status,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        alert: {
          id: alertId,
          status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating compliance alert:', error)
    return NextResponse.json(
      { error: 'Failed to update compliance alert' },
      { status: 500 }
    )
  }
}
