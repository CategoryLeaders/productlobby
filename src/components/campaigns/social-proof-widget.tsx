'use client'

import React, { useEffect, useState } from 'react'
import { Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentSupporter {
  id: string
  displayName: string
  avatar: string | null
}

interface SocialProofData {
  last24hCount: number
  recentSupporters: RecentSupporter[]
  totalSupporters: number
}

interface SocialProofWidgetProps {
  campaignId: string
  className?: string
}

/**
 * Campaign Social Proof Widget Component
 * Shows recent supporters with animated entrance
 * Displays "X people lobbied in the last 24 hours"
 * Shows small avatar bubbles of recent supporters
 * Compact widget suitable for campaign page sidebar
 */
export const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({
  campaignId,
  className,
}) => {
  const [data, setData] = useState<SocialProofData | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedIndices, setAnimatedIndices] = useState<Set<number>>(
    new Set()
  )

  useEffect(() => {
    const fetchSocialProof = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/social-proof`
        )
        if (response.ok) {
          const socialProofData: SocialProofData = await response.json()
          setData(socialProofData)

          // Animate avatars sequentially
          if (socialProofData.recentSupporters.length > 0) {
            socialProofData.recentSupporters.forEach((_, index) => {
              setTimeout(() => {
                setAnimatedIndices((prev) => {
                  const newSet = new Set(prev)
                  newSet.add(index)
                  return newSet
                })
              }, index * 100)
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch social proof:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSocialProof()
  }, [campaignId])

  if (loading) {
    return (
      <div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-4',
          className
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4',
        className
      )}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-500" />
        <p className="text-sm font-semibold text-gray-900">
          Social Proof
        </p>
      </div>

      {/* Main stat: people lobbied in last 24h */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-gray-600 mb-1">Last 24 hours</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-yellow-600">
            {data.last24hCount}
          </p>
          <p className="text-sm text-gray-700">
            {data.last24hCount === 1 ? 'person' : 'people'} lobbied
          </p>
        </div>
      </div>

      {/* Recent supporters with avatars */}
      <div>
        <p className="text-xs text-gray-600 mb-2">Recent supporters</p>
        {data.recentSupporters.length > 0 ? (
          <div className="flex items-center -space-x-2">
            {data.recentSupporters.map((supporter, index) => (
              <div
                key={supporter.id}
                className={cn(
                  'relative w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden transition-all duration-500',
                  animatedIndices.has(index)
                    ? 'scale-100 opacity-100'
                    : 'scale-0 opacity-0'
                )}
                title={supporter.displayName}
              >
                {supporter.avatar ? (
                  <img
                    src={supporter.avatar}
                    alt={supporter.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{supporter.displayName[0]?.toUpperCase()}</span>
                )}
              </div>
            ))}

            {data.totalSupporters > data.recentSupporters.length && (
              <div
                className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold"
                title={`+${data.totalSupporters - data.recentSupporters.length} more`}
              >
                +{data.totalSupporters - data.recentSupporters.length}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No supporters yet</p>
        )}
      </div>

      {/* Total supporters count */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Users className="w-3 h-3" />
          <span>
            {data.totalSupporters} total{' '}
            {data.totalSupporters === 1 ? 'supporter' : 'supporters'}
          </span>
        </div>
      </div>
    </div>
  )
}
