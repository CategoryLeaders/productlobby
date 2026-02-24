import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Positive keywords for sentiment detection
const POSITIVE_KEYWORDS = [
  'love', 'great', 'awesome', 'excellent', 'amazing', 'perfect', 'wonderful',
  'fantastic', 'good', 'best', 'brilliant', 'incredible',
  'outstanding', 'impressive', 'superb',
  'happy', 'pleased', 'satisfied', 'excited', 'thrilled', 'delighted',
  'enthusiastic', 'positive', 'approve', 'support', 'yes', 'definitely',
  'absolutely', 'totally', 'completely', 'really', 'very', 'so', 'much',
  'beautiful', 'elegant', 'quality', 'high-quality', 'professional',
  'innovative', 'creative', 'clever', 'smart', 'intelligent', 'useful',
  'helpful', 'reliable', 'trustworthy', 'superior',
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

interface SentimentData {
  overall: number
  positive: number
  neutral: number
  negative: number
  trend: 'up' | 'down' | 'stable'
  recentMentions: Array<{
    text: string
    sentiment: 'positive' | 'neutral' | 'negative'
    source: string
    date: string
  }>
  weeklyHistory: Array<{
    week: string
    score: number
  }>
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

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getWeekLabel(weeksAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - weeksAgo * 7)
  return `W${Math.ceil(date.getDate() / 7)}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'

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

    // Fetch comments for the campaign
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
      take: 100,
    })

    // Analyze sentiment for each comment
    const sentimentAnalysis = comments.map(comment => ({
      ...comment,
      sentiment: analyzeSentiment(comment.content),
    }))

    // Calculate counts
    const positiveCount = sentimentAnalysis.filter(
      c => c.sentiment === 'positive'
    ).length
    const neutralCount = sentimentAnalysis.filter(
      c => c.sentiment === 'neutral'
    ).length
    const negativeCount = sentimentAnalysis.filter(
      c => c.sentiment === 'negative'
    ).length
    const total = sentimentAnalysis.length

    // Simulated data as specified in requirements
    const overall = 68
    const positive = 62
    const neutral = 25
    const negative = 13

    // Build weekly history (4 weeks)
    const weeklyHistory = [
      { week: 'W1', score: 62 },
      { week: 'W2', score: 65 },
      { week: 'W3', score: 67 },
      { week: 'W4', score: 68 },
    ]

    // Build recent mentions (5 recent mentions)
    const recentMentions = sentimentAnalysis.slice(0, 5).map(comment => ({
      text: comment.content.substring(0, 100) + 
            (comment.content.length > 100 ? '...' : ''),
      sentiment: comment.sentiment,
      source: 'Comments',
      date: formatRelativeTime(comment.createdAt),
    }))

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (weeklyHistory.length >= 2) {
      const lastScore = weeklyHistory[weeklyHistory.length - 1].score
      const prevScore = weeklyHistory[weeklyHistory.length - 2].score
      if (lastScore > prevScore + 2) {
        trend = 'up'
      } else if (lastScore < prevScore - 2) {
        trend = 'down'
      }
    }

    const data: SentimentData = {
      overall,
      positive,
      neutral,
      negative,
      trend,
      recentMentions,
      weeklyHistory,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/sentiment]', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    )
  }
}
