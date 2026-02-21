import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/user/dashboard - Get user dashboard data
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch all data in parallel
    const [
      userCampaigns,
      userLobbies,
      userPledges,
      recentActivity,
    ] = await Promise.all([
      // User's created campaigns with lobby stats
      prisma.campaign.findMany({
        where: { creatorUserId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          targetedBrand: {
            select: { id: true, name: true, slug: true, logo: true },
          },
          media: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { lobbies: true, pledges: true },
          },
        },
      }),

      // User's lobbies (campaigns they've supported)
      prisma.lobby.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              signalScore: true,
              targetedBrand: {
                select: { name: true, logo: true },
              },
            },
          },
        },
      }),

      // User's pledges
      prisma.pledge.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      }),

      // Recent contribution events
      prisma.contributionEvent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          campaign: {
            select: { title: true, slug: true },
          },
        },
      }),
    ])

    // Calculate lobby intensity distribution for each campaign
    const campaignsWithStats = await Promise.all(
      userCampaigns.map(async (campaign) => {
        const intensityDist = await prisma.lobby.groupBy({
          by: ['intensity'],
          where: {
            campaignId: campaign.id,
            status: 'VERIFIED',
          },
          _count: true,
        })

        const distribution: Record<string, number> = {
          NEAT_IDEA: 0,
          PROBABLY_BUY: 0,
          TAKE_MY_MONEY: 0,
        }
        intensityDist.forEach((item: any) => {
          distribution[item.intensity] = item._count
        })

        const totalVerified = Object.values(distribution).reduce((a, b) => a + b, 0)

        return {
          id: campaign.id,
          slug: campaign.slug,
          title: campaign.title,
          status: campaign.status,
          signalScore: campaign.signalScore,
          createdAt: campaign.createdAt,
          targetedBrand: campaign.targetedBrand,
          firstImage: campaign.media[0]?.url || null,
          lobbyCount: campaign._count.lobbies,
          pledgeCount: campaign._count.pledges,
          verifiedLobbyCount: totalVerified,
          intensityDistribution: distribution,
        }
      })
    )

    // Calculate aggregate stats
    const totalLobbiesReceived = campaignsWithStats.reduce((sum, c) => sum + c.lobbyCount, 0)
    const totalPledgesReceived = campaignsWithStats.reduce((sum, c) => sum + c.pledgeCount, 0)
    const activeCampaigns = campaignsWithStats.filter(c => c.status === 'LIVE').length
    const totalLobbiesGiven = userLobbies.length
    const totalPledgesGiven = userPledges.length

    // Calculate contribution score from events
    const contributionScore = recentActivity.reduce((sum, event) => sum + event.points, 0)

    // Pledge financial summary
    const intentPledges = userPledges.filter(p => p.pledgeType === 'INTENT')
    const totalPledgedValue = intentPledges.reduce(
      (sum, p) => sum + (p.priceCeiling ? Number(p.priceCeiling) : 0),
      0
    )

    return NextResponse.json({
      stats: {
        totalLobbiesReceived,
        totalPledgesReceived,
        activeCampaigns,
        totalLobbiesGiven,
        totalPledgesGiven,
        contributionScore,
        totalPledgedValue,
        campaignCount: userCampaigns.length,
      },
      campaigns: campaignsWithStats,
      lobbies: userLobbies.map((lobby: any) => ({
        id: lobby.id,
        intensity: lobby.intensity,
        status: lobby.status,
        createdAt: lobby.createdAt,
        campaign: lobby.campaign,
      })),
      pledges: userPledges.map((pledge: any) => ({
        id: pledge.id,
        pledgeType: pledge.pledgeType,
        priceCeiling: pledge.priceCeiling ? Number(pledge.priceCeiling) : null,
        timeframeDays: pledge.timeframeDays,
        createdAt: pledge.createdAt,
        campaign: pledge.campaign,
      })),
      recentActivity: recentActivity.map((event: any) => ({
        id: event.id,
        eventType: event.eventType,
        points: event.points,
        createdAt: event.createdAt,
        campaign: event.campaign,
      })),
    })
  } catch (error) {
    console.error('[GET /api/user/dashboard]', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}
