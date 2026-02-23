import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface DigestStats {
  lobbyCount: number
  newComments: number
  totalShares: number
  updates: number
}

async function getCampaignDigestStats(
  campaignId: string,
  period: 'daily' | 'weekly'
): Promise<DigestStats> {
  const startDate = period === 'daily' ? subDays(new Date(), 1) : subDays(new Date(), 7)

  const [lobbies, comments, shares, updates] = await Promise.all([
    // Get total lobbies for campaign
    prisma.lobby.count({
      where: { campaignId },
    }),
    // Get comments created in period
    prisma.comment.count({
      where: {
        campaign: { id: campaignId },
        createdAt: { gte: startDate },
      },
    }),
    // Get shares in period
    prisma.share.count({
      where: {
        campaignId,
        createdAt: { gte: startDate },
      },
    }),
    // Get updates in period
    prisma.campaignUpdate.count({
      where: {
        campaignId,
        createdAt: { gte: startDate },
      },
    }),
  ])

  return {
    lobbyCount: lobbies,
    newComments: comments,
    totalShares: shares,
    updates: updates,
  }
}

function generateHtmlDigest(
  campaign: any,
  stats: DigestStats,
  period: 'daily' | 'weekly',
  baseUrl: string
): string {
  const campaignUrl = `${baseUrl}/campaigns/${campaign.slug || campaign.id}`
  const periodText = period === 'daily' ? 'Daily' : 'Weekly'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.title} - ${periodText} Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #7C3AED; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937; }
    .subtitle { font-size: 14px; color: #6b7280; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .stat-card { background: #f3f4f6; border-left: 4px solid #84CC16; padding: 15px; border-radius: 4px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #7C3AED; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
    .milestone-item { background: #f9fafb; padding: 12px; margin: 10px 0; border-radius: 4px; border-left: 3px solid #7C3AED; }
    .milestone-label { font-size: 12px; color: #7c3aed; font-weight: 600; text-transform: uppercase; }
    .milestone-text { font-size: 14px; color: #1f2937; margin-top: 4px; }
    .cta-button { display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .cta-button:hover { background: #6d28d9; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">${escapeHtml(campaign.title)}</div>
      <div class="subtitle">${periodText} Digest - ${format(new Date(), 'MMMM d, yyyy')}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.lobbyCount}</div>
        <div class="stat-label">Total Lobbies</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.newComments}</div>
        <div class="stat-label">New Comments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalShares}</div>
        <div class="stat-label">Shares</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.updates}</div>
        <div class="stat-label">Updates</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Campaign Status</div>
      <div class="milestone-item">
        <div class="milestone-label">Status</div>
        <div class="milestone-text">${escapeHtml(campaign.status)}</div>
      </div>
      <div class="milestone-item">
        <div class="milestone-label">Category</div>
        <div class="milestone-text">${escapeHtml(campaign.category)}</div>
      </div>
      ${campaign.targetedBrand ? `
      <div class="milestone-item">
        <div class="milestone-label">Targeted Brand</div>
        <div class="milestone-text">${escapeHtml(campaign.targetedBrand.name)}</div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">Key Metrics</div>
      <div class="milestone-item">
        <div class="milestone-label">Signal Score</div>
        <div class="milestone-text">${campaign.signalScore ? campaign.signalScore.toFixed(1) : 'N/A'}</div>
      </div>
      <div class="milestone-item">
        <div class="milestone-label">Completeness Score</div>
        <div class="milestone-text">${campaign.completenessScore}%</div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${campaignUrl}" class="cta-button">View Full Campaign</a>
    </div>

    <div class="footer">
      <p>This is your ${periodText.toLowerCase()} campaign digest for ProductLobby.</p>
      <p>You are receiving this email because you are the creator of this campaign.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// GET /api/campaigns/[id]/digest - Generate campaign email digest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params
    const period = (request.nextUrl.searchParams.get('period') || 'weekly') as 'daily' | 'weekly'

    // Validate period
    if (!['daily', 'weekly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be "daily" or "weekly"' },
        { status: 400 }
      )
    }

    // Get campaign with brand info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        targetedBrand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get digest statistics
    const stats = await getCampaignDigestStats(campaignId, period)

    // Generate HTML digest
    const baseUrl = request.nextUrl.origin
    const htmlContent = generateHtmlDigest(campaign, stats, period, baseUrl)

    return NextResponse.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        period,
        generatedAt: new Date().toISOString(),
        stats,
        html: htmlContent,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/digest]', error)
    return NextResponse.json(
      { error: 'Failed to generate digest' },
      { status: 500 }
    )
  }
}
