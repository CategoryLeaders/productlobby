'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CampaignRecommendationCardProps {
  id: string
  title: string
  slug: string
  category: string
  signalScore: number | null
  image?: string
  lobbyCount: number
  reason?: string
}

interface CampaignRecommendationsProps {
  campaigns: CampaignRecommendationCardProps[]
  isLoading?: boolean
  title?: string
  showArrows?: boolean
  onCardClick?: (campaignSlug: string) => void
}

const RecommendationCard: React.FC<CampaignRecommendationCardProps & { reason?: string }> = ({
  id,
  title,
  slug,
  category,
  signalScore,
  image,
  lobbyCount,
  reason,
}) => {
  return (
    <Link href={`/campaigns/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col cursor-pointer group">
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
                <div className="text-3xl mb-1">📋</div>
                <p className="text-xs font-medium">Campaign</p>
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2">
            <Badge variant="default" size="sm">
              {category}
            </Badge>
          </div>

          {signalScore !== null && signalScore > 0 && (
            <div className="absolute top-2 right-2 bg-lime-400 text-lime-900 px-2 py-1 rounded-md text-xs font-semibold">
              {signalScore.toFixed(0)}% demand
            </div>
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col">
          <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors duration-200">
            {title}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600">
              {lobbyCount} {lobbyCount === 1 ? 'supporter' : 'supporters'}
            </span>
          </div>

          {reason && (
            <p className="text-xs text-gray-500 mb-3 italic">
              {reason}
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-auto text-xs"
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

const RecommendationCardSkeleton: React.FC = () => {
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

export const CampaignRecommendations: React.FC<CampaignRecommendationsProps> = ({
  campaigns,
  isLoading = false,
  title = 'You might also like',
  showArrows = true,
  onCardClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 320
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={cn(
            'flex gap-4 overflow-x-auto pb-2 scrollbar-hide',
            'snap-x snap-mandatory'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start"
              onClick={() => onCardClick?.(campaign.slug)}
            >
              <RecommendationCard
                {...campaign}
                reason={
                  'reason' in campaign ? (campaign as any).reason : undefined
                }
              />
            </div>
          ))}
        </div>

        {showArrows && campaigns.length > 1 && (
          <>
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-violet-600" />
              </button>
            )}

            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-violet-600" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
