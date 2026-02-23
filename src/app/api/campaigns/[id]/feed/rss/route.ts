import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/feed/rss - RSS feed for campaign updates
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        creator: {
          select: {
            displayName: true,
            email: true,
          },
        },
        targetedBrand: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get campaign updates (announcements, milestones)
    const updates = await prisma.campaignUpdate.findMany({
      where: {
        campaignId,
        // Include published and scheduled updates
        OR: [{ scheduledFor: { lte: new Date() } }, { scheduledFor: null }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        creator: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    })

    // Escape XML special characters
    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    // Format date as RFC 822
    const formatRFC822 = (date: Date): string => {
      return new Date(date).toUTCString()
    }

    const baseUrl = new URL(request.url).origin
    const campaignUrl = `${baseUrl}/campaigns/${campaign.slug}`

    let rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(campaign.title)} - ProductLobby Updates</title>
    <link>${escapeXml(campaignUrl)}</link>
    <description>Updates and milestones for: ${escapeXml(campaign.description)}</description>
    <language>en-us</language>
    <ttl>1800</ttl>
`

    // Add items for each update
    updates.forEach((update) => {
      const updateUrl = `${campaignUrl}#update-${update.id}`
      const title = escapeXml(update.title)
      const content = escapeXml(update.content)
      const creatorName = escapeXml(update.creator.displayName)

      rssContent += `
    <item>
      <title>${title}</title>
      <link>${escapeXml(updateUrl)}</link>
      <description>${content}</description>
      <content:encoded><![CDATA[
        <h3>${title}</h3>
        <p>${content}</p>
        <p><strong>Type:</strong> ${update.updateType || 'ANNOUNCEMENT'}</p>
        ${update.isPinned ? '<p><em>This update is pinned</em></p>' : ''}
        <p><a href="${campaignUrl}">View campaign</a></p>
      ]]></content:encoded>
      <author>${escapeXml(update.creator.email)}</author>
      <pubDate>${formatRFC822(update.createdAt)}</pubDate>
      <guid>${escapeXml(updateUrl)}</guid>
    </item>
`
    })

    // Add campaign milestone items if milestones exist
    if (campaign.milestones && Array.isArray(campaign.milestones)) {
      const milestones = campaign.milestones as Array<{
        title: string
        description?: string
        date?: string
      }>

      milestones.forEach((milestone, index) => {
        const milestoneUrl = `${campaignUrl}#milestone-${index}`
        const title = escapeXml(milestone.title)
        const description = escapeXml(milestone.description || '')
        const date = milestone.date
          ? new Date(milestone.date)
          : campaign.createdAt

        rssContent += `
    <item>
      <title>Milestone: ${title}</title>
      <link>${escapeXml(milestoneUrl)}</link>
      <description>${description}</description>
      <content:encoded><![CDATA[
        <h4>Milestone: ${title}</h4>
        <p>${description}</p>
        <p><a href="${campaignUrl}">View campaign</a></p>
      ]]></content:encoded>
      <pubDate>${formatRFC822(date)}</pubDate>
      <guid>${escapeXml(milestoneUrl)}</guid>
    </item>
`
      })
    }

    rssContent += `
  </channel>
</rss>`

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Campaign RSS feed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
