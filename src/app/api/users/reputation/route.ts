import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Reputation tier definitions
const REPUTATION_TIERS = {
  NEWCOMER: { min: 0, max: 99, name: 'Newcomer' },
  CONTRIBUTOR: { min: 100, max: 299, name: 'Contributor' },
  ADVOCATE: { min: 300, max: 599, name: 'Advocate' },
  CHAMPION: { min: 600, max: 899, name: 'Champion' },
  LEGEND: { min: 900, max: 1000, name: 'Legend' },
}

function getTierByScore(score: number): string {
  if (score >= REPUTATION_TIERS.LEGEND.min) return REPUTATION_TIERS.LEGEND.name
  if (score >= REPUTATION_TIERS.CHAMPION.min) return REPUTATION_TIERS.CHAMPION.name
  if (score >= REPUTATION_TIERS.ADVOCATE.min) return REPUTATION_TIERS.ADVOCATE.name
  if (score >= REPUTATION_TIERS.CONTRIBUTOR.min) return REPUTATION_TIERS.CONTRIBUTOR.name
  return REPUTATION_TIERS.NEWCOMER.name
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Calculate reputation score based on multiple factors
    const [
      userData,
      campaignCount,
      lobbyCount,
      commentCount,
      contributionEventCount,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { createdAt: true },
      }),
      prisma.campaign.count({
        where: { creatorUserId: user.id },
      }),
      prisma.lobby.count({
        where: { userId: user.id },
      }),
      prisma.comment.count({
        where: { userId: user.id },
      }),
      prisma.contributionEvent.count({
        where: { userId: user.id },
      }),
    ])

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate account age in days
    const accountAgeMs = Date.now() - new Date(userData.createdAt).getTime()
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24))

    // Score calculation:
    // - Account age: 1 point per 10 days (max 50 points for 500+ days)
    // - Campaigns created: 50 points each (max 200 points for 4+)
    // - Lobbies made: 5 points each (max 100 points for 20+)
    // - Comments: 2 points each (max 100 points for 50+)
    // - Contribution events: 1 point each (max 200 points for 200+)
    // Total max: 650 points base, can go higher with contribution events

    let score = 0

    // Account age points
    const accountAgePoints = Math.min(Math.floor(accountAgeDays / 10), 50)
    score += accountAgePoints

    // Campaign creation points
    const campaignPoints = Math.min(campaignCount * 50, 200)
    score += campaignPoints

    // Lobby creation points
    const lobbyPoints = Math.min(Math.floor(lobbyCount / 2), 100)
    score += lobbyPoints

    // Comment points
    const commentPoints = Math.min(Math.floor(commentCount / 3), 100)
    score += commentPoints

    // Contribution event points
    const contributionPoints = Math.min(contributionEventCount, 200)
    score += contributionPoints

    // Cap score at 1000
    const finalScore = Math.min(score, 1000)
    const tier = getTierByScore(finalScore)

    // Calculate progress to next tier
    const nextTier = Object.values(REPUTATION_TIERS).find(
      (t) => t.min > finalScore
    )
    const nextTierMin = nextTier?.min || 1000
    const currentTierMin = Object.values(REPUTATION_TIERS).find(
      (t) => t.min <= finalScore && t.max >= finalScore
    )?.min || 0
    const progressInTier = finalScore - currentTierMin
    const tierRange = nextTierMin - currentTierMin
    const percentToNextTier = tierRange > 0 ? (progressInTier / tierRange) * 100 : 100

    return NextResponse.json({
      score: finalScore,
      tier,
      percentToNextTier: Math.min(percentToNextTier, 100),
      breakdown: {
        accountAgeDays,
        accountAgePoints,
        campaignsCreated: campaignCount,
        campaignPoints,
        lobbiesMade: lobbyCount,
        lobbyPoints,
        comments: commentCount,
        commentPoints,
        contributionEvents: contributionEventCount,
        contributionPoints,
      },
      nextTier: nextTier?.name || null,
      nextTierAt: nextTierMin,
    })
  } catch (error) {
    console.error('Error calculating reputation:', error)
    return NextResponse.json(
      { error: 'Failed to calculate reputation' },
      { status: 500 }
    )
  }
}
