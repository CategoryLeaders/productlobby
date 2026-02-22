import { prisma } from './db'
import { calculateSignalScore, CONVERSION_RATES, INTENSITY_WEIGHTS } from './signal-score'
import { Decimal } from '@prisma/client/runtime/library'

export interface DemandReport {
  campaignId: string
  campaignTitle: string
  campaignDescription: string
  category: string
  signalScore: number
  signalBreakdown: {
    neatIdea: number
    probablyBuy: number
    takeMyMoney: number
    total: number
  }
  marketSize: {
    projectedCustomers: number
    projectedRevenue: number
    medianPrice: number
    p90Price: number
  }
  growth: {
    lobbiesLast7Days: number
    lobbiesLast30Days: number
    growthRate: number
    trend: 'declining' | 'flat' | 'growing' | 'accelerating'
  }
  competitorAnalysis: {
    count: number
    averagePrice: number
    commonThemes: string[]
    competitors: Array<{
      name: string
      brand: string | null
      price: number | null
      pros: string | null
      cons: string | null
    }>
  }
  topComments: Array<{
    content: string
    user: string
    intensity: string
  }>
  recommendations: string[]
}

export async function generateDemandReport(campaignId: string): Promise<DemandReport> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      lobbies: {
        select: {
          intensity: true,
          createdAt: true,
        },
      },
      pledges: {
        select: {
          priceCeiling: true,
          createdAt: true,
          pledgeType: true,
        },
      },
      competitors: {
        orderBy: { order: 'asc' },
        select: {
          name: true,
          brand: true,
          price: true,
          pros: true,
          cons: true,
        },
      },
      comments: {
        where: { status: 'VISIBLE' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          content: true,
          user: {
            select: { displayName: true },
          },
        },
      },
    },
  })

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`)
  }

  const signalResult = await calculateSignalScore(campaignId)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const lobbiesLast7Days = campaign.lobbies.filter(
    (l) => l.createdAt >= sevenDaysAgo
  ).length
  const lobbiesLast30Days = campaign.lobbies.filter(
    (l) => l.createdAt >= thirtyDaysAgo
  ).length

  const neatIdea = campaign.lobbies.filter((l) => l.intensity === 'NEAT_IDEA').length
  const probablyBuy = campaign.lobbies.filter((l) => l.intensity === 'PROBABLY_BUY').length
  const takeMyMoney = campaign.lobbies.filter((l) => l.intensity === 'TAKE_MY_MONEY').length

  const priceCeilings = campaign.pledges
    .map((p) => p.priceCeiling)
    .filter((p): p is Decimal => p !== null)
    .map((p) => Number(p))
    .sort((a, b) => a - b)

  const medianPrice = priceCeilings.length > 0
    ? priceCeilings[Math.floor(priceCeilings.length / 2)]
    : 0
  const p90Price = priceCeilings.length > 0
    ? priceCeilings[Math.floor(priceCeilings.length * 0.9)]
    : 0

  const growthRate =
    lobbiesLast7Days > 0 && lobbiesLast30Days > 0
      ? ((lobbiesLast7Days / (lobbiesLast30Days / 4.3)) - 1) * 100
      : 0

  let trend: 'declining' | 'flat' | 'growing' | 'accelerating'
  if (growthRate < -10) trend = 'declining'
  else if (growthRate < 5) trend = 'flat'
  else if (growthRate < 50) trend = 'growing'
  else trend = 'accelerating'

  const competitorThemes: { [key: string]: number } = {}
  campaign.competitors.forEach((comp) => {
    if (comp.cons) {
      const themes = comp.cons.split(',').map((t) => t.trim().toLowerCase())
      themes.forEach((t) => {
        competitorThemes[t] = (competitorThemes[t] || 0) + 1
      })
    }
  })

  const commonThemes = Object.entries(competitorThemes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme)

  const competitorAveragePrice =
    campaign.competitors.reduce((sum, c) => sum + (c.price ? Number(c.price) : 0), 0) /
      campaign.competitors.length || 0

  const report: DemandReport = {
    campaignId,
    campaignTitle: campaign.title,
    campaignDescription: campaign.description,
    category: campaign.category,
    signalScore: signalResult.score,
    signalBreakdown: {
      neatIdea,
      probablyBuy,
      takeMyMoney,
      total: neatIdea + probablyBuy + takeMyMoney,
    },
    marketSize: {
      projectedCustomers: signalResult.projectedCustomers,
      projectedRevenue: signalResult.projectedRevenue,
      medianPrice,
      p90Price,
    },
    growth: {
      lobbiesLast7Days,
      lobbiesLast30Days,
      growthRate: Math.round(growthRate * 10) / 10,
      trend,
    },
    competitorAnalysis: {
      count: campaign.competitors.length,
      averagePrice: Math.round(competitorAveragePrice * 100) / 100,
      commonThemes,
      competitors: campaign.competitors.map((c) => ({
        name: c.name,
        brand: c.brand,
        price: c.price ? Number(c.price) : null,
        pros: c.pros,
        cons: c.cons,
      })),
    },
    topComments: campaign.comments.map((c) => {
      const lobbyForUser = campaign.lobbies.find(
        (l) => l
      )
      return {
        content: c.content.substring(0, 150),
        user: c.user.displayName,
        intensity: 'PROBABLY_BUY',
      }
    }),
    recommendations: generateRecommendations(signalResult, campaign.lobbies.length),
  }

  return report
}

function generateRecommendations(
  signalResult: any,
  totalLobbies: number
): string[] {
  const recommendations: string[] = []

  if (signalResult.score > 80) {
    recommendations.push(
      'Outstanding signal strength! This campaign shows exceptional market demand. Consider accelerating development roadmap.'
    )
  }

  if (signalResult.projectedCustomers > 100) {
    recommendations.push(
      `Market analysis suggests potential for ${signalResult.projectedCustomers}+ customers at launch. Consider scaling production planning accordingly.`
    )
  }

  if (
    signalResult.inputs.takeMyMoneyCount /
      (signalResult.inputs.takeMyMoneyCount +
        signalResult.inputs.probablyBuyCount +
        signalResult.inputs.neatIdeaCount) >
    0.4
  ) {
    recommendations.push(
      'Strong purchase intent evident in supporter feedback. Market is ready for competitive pricing at the higher end.'
    )
  }

  if (signalResult.momentum > 1.5) {
    recommendations.push(
      'Campaign momentum is accelerating. Recommend prioritizing this opportunity to capture mindshare before competitor entry.'
    )
  }

  if (totalLobbies > 200) {
    recommendations.push(
      'Large supporter base provides excellent feedback loop. Consider forming advisory group from top contributors.'
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Build team, validate core assumptions, and prepare MVP. Market shows steady interest.'
    )
  }

  return recommendations
}

export function formatReportAsHtml(report: DemandReport): string {
  const signalColor =
    report.signalScore >= 80
      ? '#84CC16'
      : report.signalScore >= 55
        ? '#8B5CF6'
        : '#EF4444'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      padding: 32px 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .content {
      padding: 32px 20px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
      border-bottom: 2px solid #7C3AED;
      padding-bottom: 8px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .metric-card {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid ${signalColor};
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }
    .metric-unit {
      font-size: 14px;
      color: #6b7280;
    }
    .signal-score {
      text-align: center;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(132, 204, 22, 0.1) 100%);
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .signal-value {
      font-size: 48px;
      font-weight: 700;
      color: ${signalColor};
      margin: 8px 0;
    }
    .signal-label {
      font-size: 14px;
      color: #6b7280;
    }
    .breakdown-bar {
      display: flex;
      height: 24px;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
      background-color: #e5e7eb;
    }
    .breakdown-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }
    .segment-neat {
      background-color: #93c5fd;
    }
    .segment-probably {
      background-color: #8b5cf6;
    }
    .segment-money {
      background-color: #84cc16;
    }
    .comment {
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
      border-left: 3px solid #7C3AED;
    }
    .comment-user {
      font-weight: 600;
      color: #111827;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .comment-text {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.5;
    }
    .recommendation {
      background-color: #ecfdf5;
      border-left: 4px solid #84cc16;
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
    }
    .recommendation-text {
      font-size: 14px;
      color: #065f46;
    }
    .cta-button {
      display: inline-block;
      background-color: #7c3aed;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 16px;
      font-size: 14px;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ProductLobby Demand Report</div>
      <p style="margin: 8px 0; opacity: 0.9;">Market validation & opportunity analysis</p>
    </div>

    <div class="content">
      <div class="section">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #111827;">${escapeHtml(report.campaignTitle)}</h1>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${escapeHtml(report.category)} • ${report.signalBreakdown.total} supporters</p>
      </div>

      <div class="signal-score">
        <div class="signal-label">Signal Strength Score</div>
        <div class="signal-value">${report.signalScore.toFixed(1)}</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">
          ${report.signalScore >= 80 ? 'Exceptional' : report.signalScore >= 55 ? 'Strong' : report.signalScore >= 35 ? 'Moderate' : 'Emerging'} market demand
        </div>
        <div class="breakdown-bar">
          ${report.signalBreakdown.total > 0 ? `
            <div class="breakdown-segment segment-neat" style="width: ${(report.signalBreakdown.neatIdea / report.signalBreakdown.total) * 100}%">
              ${report.signalBreakdown.neatIdea}
            </div>
            <div class="breakdown-segment segment-probably" style="width: ${(report.signalBreakdown.probablyBuy / report.signalBreakdown.total) * 100}%">
              ${report.signalBreakdown.probablyBuy}
            </div>
            <div class="breakdown-segment segment-money" style="width: ${(report.signalBreakdown.takeMyMoney / report.signalBreakdown.total) * 100}%">
              ${report.signalBreakdown.takeMyMoney}
            </div>
          ` : ''}
        </div>
        <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
          <span style="color: #93c5fd;">●</span> Neat Idea
          <span style="margin-left: 12px; color: #8b5cf6;">●</span> Probably Buy
          <span style="margin-left: 12px; color: #84cc16;">●</span> Take My Money
        </div>
      </div>

      <div class="section">
        <div class="section-title">Market Size & Pricing</div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Projected Customers</div>
            <div class="metric-value">${report.marketSize.projectedCustomers}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Projected Revenue</div>
            <div class="metric-value">£${(report.marketSize.projectedRevenue / 1000).toFixed(1)}k</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Median Price</div>
            <div class="metric-value">£${report.marketSize.medianPrice.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">90th Percentile</div>
            <div class="metric-value">£${report.marketSize.p90Price.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Growth Trend</div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Last 7 Days</div>
            <div class="metric-value">${report.growth.lobbiesLast7Days}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Growth Rate</div>
            <div class="metric-value" style="color: ${report.growth.growthRate > 0 ? '#84cc16' : '#ef4444'};">
              ${report.growth.growthRate > 0 ? '+' : ''}${report.growth.growthRate.toFixed(1)}%
            </div>
          </div>
        </div>
        <div style="padding: 12px; background-color: #f3f4f6; border-radius: 6px; font-size: 14px; color: #4b5563;">
          <strong>Trend:</strong> Campaign is ${report.growth.trend.charAt(0).toUpperCase() + report.growth.trend.slice(1)}
        </div>
      </div>

      ${report.competitorAnalysis.count > 0 ? `
      <div class="section">
        <div class="section-title">Competitive Landscape</div>
        <div style="padding: 12px; background-color: #f3f4f6; border-radius: 6px; margin-bottom: 12px;">
          <div style="font-size: 14px; color: #4b5563;">
            <strong>${report.competitorAnalysis.count}</strong> competitive products analyzed
          </div>
          <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
            Average price: <strong>£${report.competitorAnalysis.averagePrice.toFixed(2)}</strong>
          </div>
        </div>
        ${report.competitorAnalysis.commonThemes.length > 0 ? `
        <div style="font-size: 13px; color: #4b5563;">
          <strong>Common gaps in competitors:</strong>
          <div style="margin-top: 8px;">${report.competitorAnalysis.commonThemes.map((t) => `<span style="display: inline-block; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px; font-size: 12px;">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${report.topComments.length > 0 ? `
      <div class="section">
        <div class="section-title">Supporter Feedback</div>
        ${report.topComments.slice(0, 3).map((c) => `
        <div class="comment">
          <div class="comment-user">${escapeHtml(c.user)}</div>
          <div class="comment-text">${escapeHtml(c.content)}</div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Recommendations</div>
        ${report.recommendations.map((r) => `
        <div class="recommendation">
          <div class="recommendation-text">${escapeHtml(r)}</div>
        </div>
        `).join('')}
      </div>

      <div style="text-align: center; padding: 20px 0; border-top: 2px solid #e5e7eb;">
        <a href="https://productlobby.com" class="cta-button">View on ProductLobby</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">ProductLobby • Consumer-Driven Product Development</p>
      <p style="margin: 8px 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`
}

export function formatReportAsMarkdown(report: DemandReport): string {
  return `# ${report.campaignTitle}

**Category:** ${report.category}
**Total Supporters:** ${report.signalBreakdown.total}

---

## Signal Strength: ${report.signalScore.toFixed(1)}/100

${report.signalScore >= 80 ? 'Exceptional' : report.signalScore >= 55 ? 'Strong' : report.signalScore >= 35 ? 'Moderate' : 'Emerging'} market demand

### Supporter Breakdown
- **Take My Money:** ${report.signalBreakdown.takeMyMoney} (${report.signalBreakdown.total > 0 ? ((report.signalBreakdown.takeMyMoney / report.signalBreakdown.total) * 100).toFixed(1) : 0}%)
- **Probably Buy:** ${report.signalBreakdown.probablyBuy} (${report.signalBreakdown.total > 0 ? ((report.signalBreakdown.probablyBuy / report.signalBreakdown.total) * 100).toFixed(1) : 0}%)
- **Neat Idea:** ${report.signalBreakdown.neatIdea} (${report.signalBreakdown.total > 0 ? ((report.signalBreakdown.neatIdea / report.signalBreakdown.total) * 100).toFixed(1) : 0}%)

---

## Market Size & Pricing

| Metric | Value |
|--------|-------|
| Projected Customers | ${report.marketSize.projectedCustomers} |
| Projected Revenue | £${(report.marketSize.projectedRevenue / 1000).toFixed(1)}k |
| Median Price Point | £${report.marketSize.medianPrice.toFixed(2)} |
| 90th Percentile Price | £${report.marketSize.p90Price.toFixed(2)} |

---

## Growth Trend

- **Last 7 Days:** ${report.growth.lobbiesLast7Days} new supporters
- **Last 30 Days:** ${report.growth.lobbiesLast30Days} new supporters
- **Growth Rate:** ${report.growth.growthRate > 0 ? '+' : ''}${report.growth.growthRate.toFixed(1)}%
- **Trend:** ${report.growth.trend.charAt(0).toUpperCase() + report.growth.trend.slice(1)}

---

${report.competitorAnalysis.count > 0 ? `## Competitive Landscape

- **Competitors Analyzed:** ${report.competitorAnalysis.count}
- **Average Competitor Price:** £${report.competitorAnalysis.averagePrice.toFixed(2)}

${report.competitorAnalysis.commonThemes.length > 0 ? `### Common Gaps in Competitors
${report.competitorAnalysis.commonThemes.map((t) => `- ${t}`).join('\n')}

` : ''}` : ''}

## Recommendations

${report.recommendations.map((r) => `- ${r}`).join('\n')}

---

*Report generated on ${new Date().toLocaleDateString()} by ProductLobby*
`
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (c) => map[c])
}
