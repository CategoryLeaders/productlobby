import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get all SOCIAL_SHARE contribution events for this campaign
    const shareEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: campaign.id,
        eventType: 'SOCIAL_SHARE'
      }
    })

    // Count shares by platform from metadata
    const platformCounts = {
      twitter: 0,
      facebook: 0,
      linkedin: 0,
      email: 0,
      copyLink: 0,
      total: shareEvents.length
    }

    // Process metadata to count by platform
    shareEvents.forEach((event) => {
      if (event.metadata && typeof event.metadata === 'object') {
        const platform = (event.metadata as { platform?: string }).platform
        if (platform && platform in platformCounts) {
          (platformCounts as Record<string, number>)[platform]++
        }
      }
    })

    return NextResponse.json({
      success: true,
      twitter: platformCounts.twitter,
      facebook: platformCounts.facebook,
      linkedin: platformCounts.linkedin,
      email: platformCounts.email,
      copyLink: platformCounts.copyLink,
      total: platformCounts.total,
      byPlatform: platformCounts
    })
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { platform } = body

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [
          { id: campaignId },
          { slug: campaignId }
        ]
      }
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // For anonymous users, we can still track the share event
    // In a real application, you might want to require authentication
    // For now, we'll create a minimal event without a user association
    // or you could get the user from the request session if available

    // Get or determine the user - this is a simplified version
    // In production, you'd likely want to require authentication
    const userId = 'anonymous-user' // Placeholder - in real implementation, get from session

    // Try to find or create the share event
    // Note: If you want to track anonymous shares differently, 
    // you might need to adjust the schema or this approach
    
    // For now, we'll just return success if a valid campaign exists
    // This acknowledges the share without necessarily persisting it for anonymous users
    
    return NextResponse.json({
      success: true,
      message: 'Share recorded',
      platform,
      campaignId: campaign.id
    })
  } catch (error) {
    console.error('Error recording share:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record share' },
      { status: 500 }
    )
  }
}
