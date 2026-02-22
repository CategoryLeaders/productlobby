import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { checkOutreachThresholds } from '@/lib/brand-outreach'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const lastCheckTime = new Date(now.getTime() - 60 * 60 * 1000)

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'LIVE',
        signalScoreUpdatedAt: {
          gte: lastCheckTime,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: { outreachQueue: true },
        },
      },
      take: 100,
    })

    const results = []
    const newOutreach = []

    for (const campaign of campaigns) {
      const opportunity = await checkOutreachThresholds(campaign.id)

      if (opportunity) {
        const existingOutreach = campaign._count.outreachQueue

        if (opportunity.tier === 'BRONZE' && existingOutreach === 0) {
          for (const brand of opportunity.suggestedBrands) {
            await prisma.outreachQueue.create({
              data: {
                campaignId: campaign.id,
                brandEmail: brand.email,
                brandName: brand.name,
                subject: `Market Opportunity: "${campaign.title}" – ${opportunity.lobbyCount}+ Supporters`,
                htmlContent: `<p>Initial outreach for ${campaign.title}</p>`,
                plainTextContent: `Initial outreach for ${campaign.title}`,
                status: 'PENDING',
              },
            })
            newOutreach.push({
              campaignId: campaign.id,
              brandName: brand.name,
              tier: opportunity.tier,
            })
          }
        } else if (opportunity.tier === 'SILVER' && existingOutreach < 3) {
          const brandsToReach = Math.min(3 - existingOutreach, opportunity.suggestedBrands.length)
          for (let i = 0; i < brandsToReach; i++) {
            const brand = opportunity.suggestedBrands[i]
            await prisma.outreachQueue.create({
              data: {
                campaignId: campaign.id,
                brandEmail: brand.email,
                brandName: brand.name,
                subject: `Significant Market Demand: "${campaign.title}" – ${opportunity.lobbyCount}+ Supporters`,
                htmlContent: `<p>Demand report outreach for ${campaign.title}</p>`,
                plainTextContent: `Demand report outreach for ${campaign.title}`,
                status: 'PENDING',
              },
            })
            newOutreach.push({
              campaignId: campaign.id,
              brandName: brand.name,
              tier: opportunity.tier,
            })
          }
        } else if (opportunity.tier === 'GOLD' && existingOutreach < 5) {
          const brandsToReach = Math.min(5 - existingOutreach, opportunity.suggestedBrands.length)
          for (let i = 0; i < brandsToReach; i++) {
            const brand = opportunity.suggestedBrands[i]
            await prisma.outreachQueue.create({
              data: {
                campaignId: campaign.id,
                brandEmail: brand.email,
                brandName: brand.name,
                subject: `Premium Market Opportunity: "${campaign.title}" – ${opportunity.lobbyCount}+ Supporters`,
                htmlContent: `<p>Premium demand report for ${campaign.title}</p>`,
                plainTextContent: `Premium demand report for ${campaign.title}`,
                status: 'PENDING',
              },
            })
            newOutreach.push({
              campaignId: campaign.id,
              brandName: brand.name,
              tier: opportunity.tier,
            })
          }
        } else if (opportunity.tier === 'PLATINUM') {
          await prisma.outreachQueue.create({
            data: {
              campaignId: campaign.id,
              brandEmail: opportunity.suggestedBrands[0].email,
              brandName: opportunity.suggestedBrands[0].name,
              subject: `URGENT: Exceptional Market Opportunity – "${campaign.title}" – ${opportunity.lobbyCount}+ Supporters`,
              htmlContent: `<p>Urgent platinum outreach for ${campaign.title}</p>`,
              plainTextContent: `Urgent platinum outreach for ${campaign.title}`,
              status: 'PENDING',
            },
          })
          newOutreach.push({
            campaignId: campaign.id,
            brandName: opportunity.suggestedBrands[0].name,
            tier: opportunity.tier,
          })
        }

        results.push({
          campaignId: campaign.id,
          title: campaign.title,
          tier: opportunity.tier,
          lobbyCount: opportunity.lobbyCount,
          signalScore: opportunity.signalScore,
        })
      }
    }

    return NextResponse.json({
      checked: campaigns.length,
      opportunities: results.length,
      newOutreach: newOutreach.length,
      outreach: newOutreach,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Check thresholds error:', error)
    return NextResponse.json(
      { error: 'Failed to check thresholds' },
      { status: 500 }
    )
  }
}
