import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

// Positive keywords for sentiment detection
const POSITIVE_KEYWORDS = [
  'love', 'great', 'awesome', 'excellent', 'amazing', 'perfect', 'wonderful',
  'fantastic', 'good', 'best', 'brilliant', 'fantastic', 'incredible',
  'outstanding', 'impressive', 'superb', 'brilliant', 'fantastic',
  'happy', 'pleased', 'satisfied', 'excited', 'thrilled', 'delighted',
  'enthusiastic', 'positive', 'approve', 'support', 'yes', 'definitely',
  'absolutely', 'totally', 'completely', 'really', 'very', 'so', 'much',
  'beautiful', 'elegant', 'quality', 'high-quality', 'professional',
  'innovative', 'creative', 'clever', 'smart', 'intelligent', 'useful',
  'helpful', 'reliable', 'trustworthy', 'excellent', 'superior',
]

// Negative keywords for sentiment detection
const NEGATIVE_KEYWORDS = [
  'hate', 'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst',
  'ugly', 'disgusting', 'disgusted', 'annoyed', 'frustrated', 'angry',
  'upset', 'disappointed', 'sad', 'unhappy', 'unsatisfied', 'dislike',
  'disagree', 'no', 'never', 'not', 'don\'t', 'doesn\'t', 'won\'t',
  'complaint', 'complain', 'problem', 'issue', 'broken', 'fail', 'failed',
  'crash', 'error', 'bug', 'glitch', 'waste', 'useless', 'pointless',
  'expensive', 'overpriced', 'slow', 'incomplete', 'unfinished',
  'unreliable', 'unstable', 'confusing', 'difficult', 'hard', 'impossible',
  'ridiculous', 'stupid', 'dumb', 'poorly', 'badly', 'ineffective',
]

interface SentimentResult {
  positive: number
  neutral: number
  negative: number
  overall: 'positive' | 'neutral' | 'negative'
  score: number
  trend: {
    week: number[]
  }
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  if (!text || typeof text !== 'string') {
    return 'neutral'
  }

  const lowerText = text.toLowerCase()

  let positiveScore = 0
  let negativeScore = 0

  for (const keyword of POSITIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      positiveScore += matches.length
    }
  }

  for (const keyword of NEGATIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      negativeScore += matches.length
    }
  }

  if (positiveScore > negativeScore && positiveScore > 0) {
    return 'positive'
  } else if (negativeScore > positiveScore && negativeScore > 0) {
    return 'negative'
  }

  return 'neutral'
}

function getSentimentTrend(comments: Array<{ createdAt: Date; sentiment: string }>): number[] {
  // Get the last 7 days of sentiment trend
  const trend: number[] = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)

    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayComments = comments.filter(
      c => c.createdAt >= dayStart && c.createdAt <= dayEnd
    )

    if (dayComments.length === 0) {
      trend.push(0)
      continue
    }

    const positiveCount = dayComments.filter(c => c.sentiment === 'positive').length
    const totalCount = dayComments.length
    const score = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0

    trend.push(Math.round(score))
  }

  return trend
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch all comments for the campaign
    const comments = await prisma.comment.findMany({
      where: {
        campaignId: id,
        status: 'VISIBLE',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (comments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          positive: 0,
          neutral: 0,
          negative: 0,
          overall: 'neutral' as const,
          score: 0,
          trend: {
            week: [0, 0, 0, 0, 0, 0, 0],
          },
        },
      })
    }

    // Analyze sentiment for each comment
    const sentimentAnalysis = comments.map(comment => ({
      ...comment,
      sentiment: analyzeSentiment(comment.content),
    }))

    // Calculate percentages
    const positiveCount = sentimentAnalysis.filter(c => c.sentiment === 'positive').length
    const neutralCount = sentimentAnalysis.filter(c => c.sentiment === 'neutral').length
    const negativeCount = sentimentAnalysis.filter(c => c.sentiment === 'negative').length
    const total = sentimentAnalysis.length

    const positivePercent = (positiveCount / total) * 100
    const neutralPercent = (neutralCount / total) * 100
    const negativePercent = (negativeCount / total) * 100

    // Calculate overall sentiment score (-100 to 100, where 100 is most positive)
    const sentimentScore = Math.round(
      ((positiveCount - negativeCount) / total) * 100
    )

    // Determine overall sentiment
    let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
    if (sentimentScore > 20) {
      overallSentiment = 'positive'
    } else if (sentimentScore < -20) {
      overallSentiment = 'negative'
    }

    // Get trend
    const trend = getSentimentTrend(sentimentAnalysis)

    const result: SentimentResult = {
      positive: Math.round(positivePercent),
      neutral: Math.round(neutralPercent),
      negative: Math.round(negativePercent),
      overall: overallSentiment,
      score: sentimentScore,
      trend: {
        week: trend,
      },
    }

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        totalComments: total,
        analyzedat: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/sentiment]', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
}
