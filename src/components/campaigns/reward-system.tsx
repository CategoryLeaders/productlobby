'use client'

import React, { useEffect, useState } from 'react'
import {
  Gift,
  Loader2,
  Star,
  Trophy,
  Zap,
  Award,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

interface RewardSystemProps {
  campaignId: string
}

const getTierColors = (
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
) => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
  }
  return colors[tier]
}

const getTierIcon = (
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
) => {
  switch (tier) {
    case 'bronze':
      return Trophy
    case 'silver':
      return Star
    case 'gold':
      return Zap
    case 'platinum':
      return Award
    default:
      return Trophy
  }
}

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'badge':
      return Award
    case 'discount':
      return Gift
    case 'early_access':
      return Zap
    case 'exclusive':
      return Star
    case 'points':
      return Trophy
    default:
      return Gift
  }
}

export function RewardSystem({ campaignId }: RewardSystemProps) {
  const [rewardStatus, setRewardStatus] = useState<UserRewardStatus | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/rewards`
        )
        if (!response.ok) throw new Error('Failed to fetch rewards')
        const data = await response.json()
        setRewardStatus(data)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load rewards'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [campaignId])

  const claimReward = async (reward: Reward) => {
    if (!rewardStatus) return

    try {
      setClaimingId(reward.id)
      const response = await fetch(
        `/api/campaigns/${campaignId}/rewards`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rewardId: reward.id }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Failed to claim reward'
        )
      }

      const updatedStatus = await response.json()
      setRewardStatus(updatedStatus)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to claim reward'
      )
    } finally {
      setClaimingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (!rewardStatus) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          {error || 'Unable to load rewards'}
        </p>
      </div>
    )
  }

  const TierIcon = getTierIcon(rewardStatus.currentTier)
  const tierColor = getTierColors(rewardStatus.currentTier)

  const unclaimedRewards = rewardStatus.availableRewards.filter(
    (r) => !rewardStatus.claimedRewards.includes(r.id)
  )

  const claimedRewards = rewardStatus.availableRewards.filter((r) =>
    rewardStatus.claimedRewards.includes(r.id)
  )

  const nextTierPoints = {
    bronze: 100,
    silver: 500,
    gold: 1000,
    platinum: 2000,
  }

  const nextTier = {
    bronze: 'silver',
    silver: 'gold',
    gold: 'platinum',
    platinum: 'platinum',
  }[rewardStatus.currentTier] as
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'platinum'
  const nextTierPoints_ =
    nextTierPoints[
      nextTier as keyof typeof nextTierPoints
    ]
  const tierProgress = Math.min(
    100,
    Math.round(
      (rewardStatus.totalPoints / nextTierPoints_) * 100
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-violet-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Supporter Rewards
        </h2>
        <p className="text-sm text-gray-600">
          Earn points and unlock exclusive rewards
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Points Card */}
        <div className="rounded-lg border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Points
              </p>
              <p className="text-3xl font-bold text-violet-700">
                {rewardStatus.totalPoints}
              </p>
            </div>
            <Trophy className="h-12 w-12 text-violet-500" />
          </div>
        </div>

        {/* Tier Card */}
        <div
          className="rounded-lg border-2 p-6"
          style={{
            borderColor: tierColor,
            background: `${tierColor}15`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Current Tier
              </p>
              <p
                className="text-3xl font-bold capitalize"
                style={{ color: tierColor }}
              >
                {rewardStatus.currentTier}
              </p>
            </div>
            <TierIcon
              className="h-12 w-12"
              style={{ color: tierColor }}
            />
          </div>
        </div>
      </div>

      {/* Tier Progress */}
      {rewardStatus.currentTier !== 'platinum' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Progress to {nextTier}
            </p>
            <p className="text-sm text-gray-600">
              {rewardStatus.totalPoints} / {nextTierPoints_} points
            </p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-lime-500 transition-all"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Available Rewards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Available Rewards ({unclaimedRewards.length})
        </h3>

        {unclaimedRewards.length === 0 ? (
          <p className="text-sm text-gray-600">
            No available rewards yet. Keep supporting to unlock more!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unclaimedRewards.map((reward) => {
              const RewardIcon = getRewardIcon(reward.type)
              const canClaim =
                rewardStatus.totalPoints >= reward.pointsCost &&
                reward.claimed < reward.quantity
              const isSoldOut = reward.claimed >= reward.quantity

              return (
                <div
                  key={reward.id}
                  className="overflow-hidden rounded-lg border border-violet-200 bg-white transition-all hover:shadow-lg"
                >
                  {reward.imageUrl && (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="h-32 w-full object-cover"
                    />
                  )}

                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {reward.name}
                        </h4>
                        <p
                          className="text-xs font-medium uppercase"
                          style={{
                            color: getTierColors(reward.tier),
                          }}
                        >
                          {reward.tier}
                        </p>
                      </div>
                      <RewardIcon className="h-5 w-5 text-violet-600" />
                    </div>

                    <p className="mb-3 text-sm text-gray-600">
                      {reward.description}
                    </p>

                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Cost
                        </span>
                        <span className="font-semibold text-violet-700">
                          {reward.pointsCost} points
                        </span>
                      </div>
                      {isSoldOut && (
                        <div className="text-xs font-medium text-red-600">
                          Sold Out
                        </div>
                      )}
                      {!isSoldOut && (
                        <div className="text-xs text-gray-500">
                          {reward.quantity - reward.claimed}{' '}
                          of {reward.quantity} available
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => claimReward(reward)}
                      disabled={
                        !canClaim ||
                        claimingId === reward.id
                      }
                      className={cn(
                        'w-full',
                        canClaim
                          ? 'bg-gradient-to-r from-violet-600 to-lime-600 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {claimingId === reward.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Gift className="mr-2 h-4 w-4" />
                          Claim Reward
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Claimed Rewards ({claimedRewards.length})
          </h3>

          <div className="space-y-2">
            {claimedRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-3 rounded-lg border border-lime-200 bg-lime-50 p-3"
              >
                <CheckCircle className="h-5 w-5 text-lime-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {reward.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {reward.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
