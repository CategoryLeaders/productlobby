'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RelatedCampaignData {
  id: string
  title: string
  slug: string
  category: string
  status: string
  image: string | null
  lobbyCount: number
  description: string
}

interface RelatedCampaignsProps {
  campaignId: string
  category: string
  onLoaded?: () => void
}

const RelatedCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg overflow-hidden">
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

const RelatedCard: React.FC<RelatedCampaignData> = ({
  id,
  title,
  slug,
  category,
  image,
  lobbyCount,
  description,
}) => {
  return (
    <Link href={`/campaigns/${slug}`}>
      <div className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer group hover:border-violet-300">
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
                <div className="text-3xl mb-1">💡</div>
                <p className="text-xs font-medium">Campaign</p>
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2">
            <Badge variant="default" size="sm">
              {category}
            </Badge>
          </div>
        </div>

        <div className="flex-1 p-3 flex flex-col">
          <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors duration-200">
            {title}
          </h4>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1">
            {description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600">
              {lobbyCount} {lobbyCount === 1 ? 'supporter' : 'supporters'}
            </span>
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

export const RelatedCampaigns: React.FC<RelatedCampaignsProps> = ({
  campaignId,
  category,
  onLoaded,
}) => {
  const [campaigns, setCampaigns] = useState<RelatedCampaignData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const fetchRelatedCampaigns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/campaigns/${campaignId}/related`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch related campaigns')
        }

        const data = await response.json()
        setCampaigns(data.data || [])
        onLoaded?.()
      } catch (err) {
        console.error('Error fetching related campaigns:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedCampaigns()
  }, [campaignId, onLoaded])

  // Handle scroll position for arrow visibility
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    updateScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', updateScrollButtons)
      window.addEventListener('resize', updateScrollButtons)
      return () => {
        container.removeEventListener('scroll', updateScrollButtons)
        window.removeEventListener('resize', updateScrollButtons)
      }
    }
  }, [campaigns])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280 // card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Similar Campaigns
            </h3>
            <p className="text-sm text-gray-600">
              Other campaigns in {category}
            </p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <RelatedCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !campaigns || campaigns.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Similar Campaigns
          </h3>
          <p className="text-sm text-gray-600">
            Other campaigns in {category}
          </p>
        </div>
        <Link
          href={`/campaigns?category=${encodeURIComponent(category)}`}
          className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
        >
          See more in {category} →
        </Link>
      </div>

      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {campaigns.map((campaign) => (
            <RelatedCard key={campaign.id} {...campaign} />
          ))}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all duration-200 shadow-sm"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        div[style*="scrollBehavior"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
