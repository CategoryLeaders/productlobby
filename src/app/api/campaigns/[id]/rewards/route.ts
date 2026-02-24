import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Reward {
  id: string
  campaignId: string
  name: string
  description: string
  type: 'badge' | 'discount' | 'early_access' | 'exclusive' | 'points'
  pointsCost: number
  quantity: number
  claimed: number
  imageUrl?: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface UserRewardStatus {
  totalPoints: number
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  claimedRewards: string[]
  availableRewards: Reward[]
}

// Simulated rewards data
const SIMULATED_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    campaignId: 'campaign-1',
    name: 'Early Supporter Badge',
    description:
      'Exclusive badge recognizing your early support',
    type: 'badge',
    pointsCost: 50,
    quantity: 500,
    claimed: 120,
    tier: 'bronze',
  },
  {
    id: 'reward-2',
    campaignId: 'campaign-1',
    name: '10% Discount Code',
    description: 'Use code SUPPORTER10 for 10% off',
    type: 'discount',
    pointsCost: 150,
    quantity: 250,
    claimed: 85,
    tier: 'silver',
  },
  {
    id: 'reward-3',
    campaignId: 'campaign-1',
    name: 'Beta Access Pass',
    description:
      'Get early access to beta features and updates',
    type: 'early_access',
    pointsCost: 300,
    quantity: 100,
    claimed: 45,
    tier: 'gold',
  },
  {
    id: 'reward-4',
    campaignId: 'campaign-1',
    name: 'Exclusive Update',
    description: 'Receive exclusive updates and insider news',
    type: 'exclusive',
    pointsCost: 250,
    quantity: 150,
    claimed: 62,
    tier: 'gold',
  },
  {
    id: 'reward-5',
    campaignId: 'campaign-1',
    name: 'VIP Advocate Status',
    description:
      'VIP status with special recognition and perks',
    type: 'points',
    pointsCost: 500,
    quantity: 50,
    claimed: 18,
    tier: 'platinum',
  },
]

/**
 * GET /api/campaigns/[id]/rewards
 * Get user's reward status and available rewards for a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get user's contribution events to calculate points
    const contributionEvents =
      await prisma.contributionEvent.findMany({
        where: {
          userId: user.id,
          campaignId: campaignId,
        },
        select: {
          eventType: true,
          points: true,
          metadata: true,
        },
      })

    // Calculate total points (each event contributes based on type)
    let totalPoints = 0
    const claimedRewardIds = new Set<string>()

    contributionEvents.forEach((event) => {
      // Award points based on event type
      switch (event.eventType) {
        case 'PREFERENCE_SUBMITTED':
          totalPoints += 10
          break
        case 'WISHLIST_SUBMITTED':
          totalPoints += 15
          break
        case 'REFERRAL_SIGNUP':
          totalPoints += 100
          break
        case 'COMMENT_ENGAGEMENT':
          totalPoints += 5
          break
        case 'SOCIAL_SHARE':
          totalPoints += 25
          // Check if this is a reward claim
          if (
            event.metadata &&
            typeof event.metadata === 'object' &&
            'action' in event.metadata &&
            (event.metadata as any).action === 'reward_claim'
          ) {
            claimedRewardIds.add(
              (event.metadata as any).rewardId
            )
          }
          break
        case 'BRAND_OUTREACH':
          totalPoints += 50
          break
        default:
          totalPoints += event.points || 0
      }
    })

    // Determine user's tier based on points
    let currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' =
      'bronze'
    if (totalPoints >= 2000) {
      currentTier = 'platinum'
    } else if (totalPoints >= 1000) {
      currentTier = 'gold'
    } else if (totalPoints >= 500) {
      currentTier = 'silver'
    }

    // Filter rewards based on tier and availability
    const availableRewards = SIMULATED_REWARDS.filter(
      (reward) => {
        // Can see rewards of own tier and below
        const tierRank = {
          bronze: 0,
          silver: 1,
          gold: 2,
          platinum: 3,
        }
        return (
          tierRank[reward.tier] <= tierRank[currentTier]
        )
      }
    )

    const userRewardStatus: UserRewardStatus = {
      totalPoints,
      currentTier,
      claimedRewards: Array.from(claimedRewardIds),
      availableRewards,
    }

    return NextResponse.json(userRewardStatus)
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/campaigns/[id]/rewards
 * Claim a reward for the user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { rewardId } = body

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Find the reward
    const reward = SIMULATED_REWARDS.find((r) => r.id === rewardId)
    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      )
    }

    // Get user's current points
    const contributionEvents =
      await prisma.contributionEvent.findMany({
        where: {
          userId: user.id,
          campaignId: campaignId,
        },
        select: {
          eventType: true,
          points: true,
        },
      })

    let totalPoints = 0
    contributionEvents.forEach((event) => {
      switch (event.eventType) {
        case 'PREFERENCE_SUBMITTED':
          totalPoints += 10
          break
        case 'WISHLIST_SUBMITTED':
          totalPoints += 15
          break
        case 'REFERRAL_SIGNUP':
          totalPoints += 100
          break
        case 'COMMENT_ENGAGEMENT':
          totalPoints += 5
          break
        case 'SOCIAL_SHARE':
          totalPoints += 25
          break
        case 'BRAND_OUTREACH':
          totalPoints += 50
          break
        default:
          totalPoints += event.points || 0
      }
    })

    // Validate points
    if (totalPoints < reward.pointsCost) {
      return NextResponse.json(
        {
          error: `Insufficient points. You have ${totalPoints} points but need ${reward.pointsCost}`,
        },
        { status: 400 }
      )
    }

    // Validate quantity
    if (reward.claimed >= reward.quantity) {
      return NextResponse.json(
        { error: 'This reward is sold out' },
        { status: 400 }
      )
    }

    // Create contribution event for reward claim
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        points: 0,
        metadata: {
          action: 'reward_claim',
          rewardId: reward.id,
          rewardName: reward.name,
        },
      },
    })

    // Return updated reward status
    let currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' =
      'bronze'
    if (totalPoints >= 2000) {
      currentTier = 'platinum'
    } else if (totalPoints >= 1000) {
      currentTier = 'gold'
    } else if (totalPoints >= 500) {
      currentTier = 'silver'
    }

    const tierRank = {
      bronze: 0,
      silver: 1,
      gold: 2,
      platinum: 3,
    }

    const availableRewards = SIMULATED_REWARDS.filter(
      (r) => tierRank[r.tier] <= tierRank[currentTier]
    )

    const userRewardStatus: UserRewardStatus = {
      totalPoints,
      currentTier,
      claimedRewards: [rewardId],
      availableRewards,
    }

    return NextResponse.json(userRewardStatus)
  } catch (error) {
    console.error('Error claiming reward:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
