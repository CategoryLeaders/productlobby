import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface WeatherReport {
  emoji: string
  condition: string
  description: string
  temperature: number
  windSpeed: number
  sunshineLevel: number
  pressure: number
  forecast: string
  metrics: {
    lobbiesGrowth: number
    commentsVelocity: number
    sentimentScore: number
    signalScore: number
  }
}

function getWeatherEmoji(temp: number): string {
  if (temp >= 90) return '🔥'
  if (temp >= 80) return '☀️'
  if (temp >= 70) return '🌤️'
  if (temp >= 60) return '⛅'
  if (temp >= 50) return '🌧️'
  if (temp >= 40) return '⛈️'
  return '❄️'
}

function getWeatherCondition(temp: number): string {
  if (temp >= 90) return 'Scorching'
  if (temp >= 80) return 'Hot'
  if (temp >= 70) return 'Warm'
  if (temp >= 60) return 'Mild'
  if (temp >= 50) return 'Cool'
  if (temp >= 40) return 'Cold'
  return 'Freezing'
}

function getForecast(temp: number, windSpeed: number, sentimentScore: number): string {
  if (temp >= 85 && windSpeed >= 20) {
    return '🌪️ Momentum is building! Your campaign is experiencing explosive growth.'
  }
  if (temp >= 80 && sentimentScore >= 0.8) {
    return '☀️ Clear skies ahead! Community sentiment is extremely positive.'
  }
  if (temp >= 70) {
    return '🌤️ Steady progress. Keep nurturing this momentum with regular updates.'
  }
  if (temp >= 60) {
    return '⛅ Fair conditions. The campaign is stable. Consider engaging with the community to boost growth.'
  }
  if (temp >= 50) {
    return '🌧️ Some rain on the parade. Activity is lower. Try reaching out to supporters for renewed interest.'
  }
  if (temp >= 40) {
    return '⛈️ Stormy conditions. Campaign needs attention. Consider new initiatives to re-engage the community.'
  }
  return '❄️ Winter is here. The campaign has slowed significantly. Time for a major refresh or new announcement.'
}

// GET /api/campaigns/[id]/weather - Get weather report for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const campaign = await prisma.campaign.findFirst({
      where: isUuid ? { id } : { slug: id },
      select: {
        id: true,
        title: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get lobby stats for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      totalLobbies,
      recentLobbies,
      comments,
      commentsTrend,
    ] = await Promise.all([
      // Total lobbies
      prisma.lobby.count({
        where: {
          campaignId: campaign.id,
          status: 'VERIFIED',
        },
      }),
      // Recent lobbies (last 7 days)
      prisma.lobby.count({
        where: {
          campaignId: campaign.id,
          status: 'VERIFIED',
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      // Total comments
      prisma.comment.count({
        where: {
          campaign: {
            id: campaign.id,
          },
        },
      }),
      // Comments from last 7 days
      prisma.comment.count({
        where: {
          campaign: {
            id: campaign.id,
          },
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ])

    // Calculate sentiment (mock calculation based on available data)
    // In a real system, this would be based on actual sentiment analysis
    const sentimentBase = comments > 0 ? Math.min(0.95, 0.5 + (comments / 1000) * 0.4) : 0.5

    // Get a previous period for comparison
    const thirteenDaysAgo = new Date()
    thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13)

    const previousPeriodLobbies = await prisma.lobby.count({
      where: {
        campaignId: campaign.id,
        status: 'VERIFIED',
        createdAt: {
          gte: thirteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    })

    // Calculate metrics
    const lobbiesGrowth = previousPeriodLobbies > 0
      ? ((recentLobbies - previousPeriodLobbies) / previousPeriodLobbies) * 100
      : (recentLobbies > 0 ? 100 : 0)

    // Wind speed based on comment velocity
    const windSpeed = (commentsTrend / 7) * 5 // comments per day * 5

    // Sunshine based on sentiment
    const sunshineLevel = sentimentBase * 100

    // Pressure based on signal score (mock)
    const signalScore = Math.min(100, (totalLobbies / 100) * 10)
    const pressure = 950 + (signalScore / 100) * 70 // 950-1020 mb range

    // Temperature mapping: lobbies growth
    // Scale: -100% to +200% growth becomes 32°F to 95°F
    let temperature = 72 // Base temperature
    if (lobbiesGrowth > 0) {
      temperature = Math.min(95, 72 + (lobbiesGrowth / 2))
    } else {
      temperature = Math.max(32, 72 + (lobbiesGrowth / 2))
    }

    // Round values
    temperature = Math.round(temperature)
    const finalWindSpeed = Math.round(windSpeed * 10) / 10
    const finalSunshine = Math.round(sunshineLevel)
    const finalPressure = Math.round(pressure * 10) / 10

    const emoji = getWeatherEmoji(temperature)
    const condition = getWeatherCondition(temperature)
    const forecast = getForecast(temperature, finalWindSpeed, sentimentBase)

    const report: WeatherReport = {
      emoji,
      condition,
      description: `Campaign weather: ${condition} conditions with ${
        finalWindSpeed > 15 ? 'strong' : finalWindSpeed > 5 ? 'moderate' : 'light'
      } engagement winds`,
      temperature,
      windSpeed: finalWindSpeed,
      sunshineLevel: finalSunshine,
      pressure: finalPressure,
      forecast,
      metrics: {
        lobbiesGrowth: Math.round(lobbiesGrowth * 100) / 100,
        commentsVelocity: commentsTrend,
        sentimentScore: Math.round(sentimentBase * 100),
        signalScore: Math.round(signalScore),
      },
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/weather]', error)
    return NextResponse.json(
      { error: 'Failed to generate weather report' },
      { status: 500 }
    )
  }
}
