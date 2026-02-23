import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CampaignComparison {
  id: string
  slug: string
  title: string
  status: string
  createdAt: string
  lobbyCount: number
  commentCount: number
  signalScore: number | null
  sentiment?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Missing ids parameter' },
        { status: 400 }
      )
    }

    // Parse and validate IDs
    const ids = idsParam.split(',').filter((id) => id.trim())

    if (ids.length === 0 || ids.length > 4) {
      return NextResponse.json(
        { error: 'Please provide between 1 and 4 campaign IDs' },
        { status: 400 }
      )
    }

    // Fetch campaigns (try by ID or slug)
    const campaigns = await Promise.all(
      ids.map(async (id) => {
        const campaign = await prisma.campaign.findFirst({
          where: {
            OR: [
              { id: id.trim() },
              { slug: id.trim() },
            ],
          },
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            createdAt: true,
            signalScore: true,
            lobbies: {
              select: { id: true },
            },
            comments: {
              select: { id: true, content: true },
            },
          },
        })

        return campaign
      })
    )

    // Filter out null results and map to response
    const validCampaigns: CampaignComparison[] = campaigns
      .filter((c) => c !== null)
      .map((campaign) => {
        // Calculate basic sentiment from comments (simple heuristic)
        const positive = campaign.comments.filter((c) =>
          /amazing|great|love|excellent|perfect|awesome/i.test(c.content)
        ).length
        const negative = campaign.comments.filter((c) =>
          /bad|terrible|hate|poor|awful|terrible/i.test(c.content)
        ).length

        let sentiment = 'neutral'
        if (positive > negative) sentiment = 'positive'
        if (negative > positive) sentiment = 'negative'

        return {
          id: campaign.id,
          slug: campaign.slug,
          title: campaign.title,
          status: campaign.status,
          createdAt: campaign.createdAt.toISOString(),
          lobbyCount: campaign.lobbies.length,
          commentCount: campaign.comments.length,
          signalScore: campaign.signalScore,
          sentiment,
        }
      })

    if (validCampaigns.length === 0) {
      return NextResponse.json(
        { error: 'No campaigns found with the provided IDs' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      campaigns: validCampaigns,
      count: validCampaigns.length,
    })
  } catch (error) {
    console.error('[GET /api/campaigns/compare]', error)
    return NextResponse.json(
      { error: 'Failed to compare campaigns' },
      { status: 500 }
    )
  }
}
