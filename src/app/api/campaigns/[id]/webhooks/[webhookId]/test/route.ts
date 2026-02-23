import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/campaigns/[id]/webhooks/[webhookId]/test - Test a webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; webhookId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: campaignId, webhookId } = params

    // Find campaign and verify ownership
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
      select: { id: true, creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Only campaign creators can test webhooks' },
        { status: 403 }
      )
    }

    // Find the webhook
    const webhook = await prisma.campaignWebhook.findFirst({
      where: {
        id: webhookId,
        campaignId: campaign.id,
      },
    })

    if (!webhook) {
      return NextResponse.json(
        { success: false, error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Send test payload to webhook
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      campaign: {
        id: campaign.id,
        name: 'Test Campaign',
      },
      data: {
        message: 'This is a test webhook delivery',
      },
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ProductLobby-Event': 'test',
          'X-ProductLobby-Signature': 'test-signature',
        },
        body: JSON.stringify(testPayload),
        timeout: 10000,
      })

      // Update lastTriggered timestamp
      await prisma.campaignWebhook.update({
        where: { id: webhook.id },
        data: { lastTriggered: new Date() },
      })

      if (!response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Test payload sent',
          statusCode: response.status,
          warning: `Webhook responded with status ${response.status}`,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Test payload sent successfully',
        statusCode: response.status,
      })
    } catch (fetchError) {
      console.error('Error sending test payload:', fetchError)

      // Still record the test attempt
      try {
        await prisma.campaignWebhook.update({
          where: { id: webhook.id },
          data: { lastTriggered: new Date() },
        })
      } catch {
        // Ignore update errors
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to send test payload to webhook URL',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      })
    }
  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to test webhook' },
      { status: 500 }
    )
  }
}
