import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/feed/rss - RSS feed of latest campaigns
export async function GET(request: NextRequest) {
  try {
    // Get the 30 most recent LIVE campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'LIVE' },
      orderBy: { createdAt: 'desc' },
      take: 30,
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

    // Build RSS feed
    const baseUrl = new URL(request.url).origin
    const feedUrl = `${baseUrl}/api/campaigns/feed/rss`
    const campaignsUrl = `${baseUrl}/campaigns`

    // Escape XML special characters
    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    // Format date as RFC 822 (required for RSS)
    const formatRFC822 = (date: Date): string => {
      return new Date(date).toUTCString()
    }

    let rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>ProductLobby - Latest Campaigns</title>
    <link>${escapeXml(campaignsUrl)}</link>
    <description>Discover the latest consumer advocacy campaigns on ProductLobby</description>
    <language>en-us</language>
    <ttl>3600</ttl>
`

    // Add campaign items
    campaigns.forEach((campaign) => {
      const campaignUrl = `${campaignsUrl}/${campaign.slug}`
      const description = escapeXml(campaign.description)
      const title = escapeXml(campaign.title)
      const creatorName = escapeXml(campaign.creator.displayName)
      const brandInfo = campaign.targetedBrand
        ? ` (targeting ${escapeXml(campaign.targetedBrand.name)})`
        : ''

      rssContent += `
    <item>
      <title>${title}</title>
      <link>${escapeXml(campaignUrl)}</link>
      <description>${description}${brandInfo}</description>
      <content:encoded><![CDATA[
        <p>${description}</p>
        ${brandInfo ? `<p><strong>Brand:</strong> ${campaign.targetedBrand?.name}</p>` : ''}
        <p><strong>Creator:</strong> ${creatorName}</p>
        <p><a href="${campaignUrl}">View full campaign</a></p>
      ]]></content:encoded>
      <author>${escapeXml(campaign.creator.email)}</author>
      <pubDate>${formatRFC822(campaign.createdAt)}</pubDate>
      <guid>${escapeXml(campaignUrl)}</guid>
    </item>
`
    })

    rssContent += `
  </channel>
</rss>`

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
