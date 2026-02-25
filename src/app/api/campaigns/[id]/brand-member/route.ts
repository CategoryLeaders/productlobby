import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/campaigns/[id]/brand-member
 * Check if the current user is a member of the brand targeted by this campaign.
 * Used to gate access to brand-only features like posting updates.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ isMember: false })
    }

    const { id: campaignId } = params

    // Get the campaign's targeted brand
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        targetedBrandId: true,
        creatorUserId: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Campaign creator is always considered a "member" for update posting
    if (campaign.creatorUserId === user.id) {
      return NextResponse.json({ isMember: true, role: 'CREATOR' })
    }

    // If no targeted brand, only the creator can post updates
    if (!campaign.targetedBrandId) {
      return NextResponse.json({ isMember: false })
    }

    // Check if user is on the brand team
    const brandTeamMember = await prisma.brandTeam.findUnique({
      where: {
        brandId_userId: {
          brandId: campaign.targetedBrandId,
          userId: user.id,
        },
      },
      select: { role: true },
    })

    if (brandTeamMember) {
      return NextResponse.json({
        isMember: true,
        role: brandTeamMember.role,
      })
    }

    return NextResponse.json({ isMember: false })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/brand-member]', error)
    return NextResponse.json({ isMember: false })
  }
}
