'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/skeleton'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TrendingCampaignProps {
  id: string
  title: string
  slug: string
  category: string
  signalScore: number | null
  image?: string
  lobbyCount: number
  trendPercentage?: number
}

interface TrendingCampaignsProps {
  campaigns: TrendingCampaignProps[]
  isLoading?: boolean
  autoRefreshInterval?: number
  onRefresh?: () => void
}

const TrendingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton variant="block" height="160px" className="w-full" />
      <div className="p-3 space-y-3">
        <Skeleton variant="line" width="85%" />
        <Skeleton variant="line" width="60%" height="14px" />
        <div className="pt-2">
          <Skeleton variant="button" height="32px" />
        </div>
      </div>
    </div>
  )
}

const TrendingCard: React.FC<TrendingCampaignProps> = ({
  id,
  title,
  slug,
  category,
  signalScore,
  image,
  lobbyCount,
  trendPercentage = 0,
}) => {
  return (
    <Link href={`/campaigns/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col cursor-pointer group hover:border-violet-300">
        <div className="relative w-full h-40 bg-gradient-to-br from-violet-50 to-violet-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-violet-300 text-center">
                <div className="text-3xl mb-1">🔥</div>
                <p className="text-xs font-medium">Trending</p>
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2">
            <Badge variant="default" size="sm">
              {category}
            </Badge>
          </div>

          {trendPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-orange-400 text-orange-900 px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
              <ArrowUp size={12} />
              {trendPercentage}%
            </div>
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col">
          <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors duration-200">
            {title}
          </h4>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600">
              {lobbyCount} {lobbyCount === 1 ? 'supporter' : 'supporters'}
            </span>
            {signalScore !== null && signalScore > 0 && (
              <span className="text-xs font-semibold text-lime-600">
                {signalScore.toFixed(0)}% demand
              </span>
            )}
          </div>

          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
              style={{
                width: `${Math.min(100, (signalScore || 0) * 1.2)}%`,
              }}
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            View Campaign
          </Button>
        </div>
      </div>
    </Link>
  )
}

export const TrendingCampaigns: React.FC<TrendingCampaignsProps> = ({
  campaigns,
  isLoading = false,
  autoRefreshInterval = 5 * 60 * 1000,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!autoRefreshInterval || !onRefresh) return

    const setupRefresh = () => {
      refreshTimerRef.current = setTimeout(() => {
        setIsRefreshing(true)
        onRefresh()
        setIsRefreshing(false)
        setupRefresh()
      }, autoRefreshInterval)
    }

    setupRefresh()

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [autoRefreshInterval, onRefresh])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-xl">🔥</span>
            Trending Now
          </h3>
          <span className="text-xs text-gray-500">
            Updates every 5 minutes
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <TrendingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-xl">🔥</span>
          Trending Now
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No trending campaigns at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-xl">🔥</span>
          Trending Now
        </h3>
        <button
          onClick={() => {
            setIsRefreshing(true)
            onRefresh?.()
            setTimeout(() => setIsRefreshing(false), 500)
          }}
          disabled={isRefreshing}
          className={cn(
            'text-xs px-3 py-1 rounded-md transition-all duration-200',
            isRefreshing
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
          )}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {campaigns.map((campaign) => (
          <TrendingCard key={campaign.id} {...campaign} />
        ))}
      </div>
    </div>
  )
}
