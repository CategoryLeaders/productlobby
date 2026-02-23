import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// DELETE /api/campaigns/[id]/webhooks/[webhookId] - Delete a specific webhook
export async function DELETE(
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
        { success: false, error: 'Only campaign creators can delete webhooks' },
        { status: 403 }
      )
    }

    // Find and delete the webhook
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

    await prisma.campaignWebhook.delete({
      where: { id: webhook.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted',
    })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}
