'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Award,
  Loader2,
  Filter,
  TrendingUp,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

interface ContributionEntry {
  id: string
  eventType: string
  description: string
  campaignId: string
  campaignName: string
  campaignSlug: string
  points: number
  createdAt: string
}

interface SummaryStats {
  totalContributions: number
  totalPoints: number
  campaignsParticipated: number
}

type FilterTab = 'all' | 'lobbies' | 'comments' | 'shares' | 'other'

interface ContributionHistoryProps {
  className?: string
}

function getEventIcon(eventType: string) {
  const iconProps = 'w-5 h-5'
  
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
    case 'WISHLIST_SUBMITTED':
      return <ThumbsUp className={`${iconProps} text-violet-600`} />
    case 'COMMENT_ENGAGEMENT':
      return <MessageSquare className={`${iconProps} text-violet-600`} />
    case 'SOCIAL_SHARE':
      return <Share2 className={`${iconProps} text-lime-600`} />
    case 'REFERRAL_SIGNUP':
    case 'BRAND_OUTREACH':
      return <Award className={`${iconProps} text-lime-600`} />
    default:
      return <Award className={`${iconProps} text-gray-500`} />
  }
}

function getFilterCategory(eventType: string): FilterTab {
  switch (eventType) {
    case 'PREFERENCE_SUBMITTED':
    case 'WISHLIST_SUBMITTED':
      return 'lobbies'
    case 'COMMENT_ENGAGEMENT':
      return 'comments'
    case 'SOCIAL_SHARE':
      return 'shares'
    default:
      return 'other'
  }
}

export function ContributionHistory({ className }: ContributionHistoryProps) {
  const [contributions, setContributions] = useState<ContributionEntry[]>([])
  const [allContributions, setAllContributions] = useState<ContributionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [stats, setStats] = useState<SummaryStats>({
    totalContributions: 0,
    totalPoints: 0,
    campaignsParticipated: 0,
  })
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const LIMIT = 20

  // Initial load
  useEffect(() => {
    fetchContributions(0, true)
  }, [])

  // Update filtered view when active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setContributions(allContributions)
    } else {
      const filtered = allContributions.filter(
        (c) => getFilterCategory(c.eventType) === activeFilter
      )
      setContributions(filtered)
    }
  }, [activeFilter, allContributions])

  // Update stats
  useEffect(() => {
    const uniqueCampaigns = new Set(allContributions.map((c) => c.campaignId))
    const totalPoints = allContributions.reduce((sum, c) => sum + c.points, 0)
    
    setStats({
      totalContributions: allContributions.length,
      totalPoints,
      campaignsParticipated: uniqueCampaigns.size,
    })
  }, [allContributions])

  const fetchContributions = async (newOffset: number, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(
        `/api/users/contributions?limit=${LIMIT}&offset=${newOffset}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch contributions')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch contributions')
      }

      if (isInitial) {
        setAllContributions(result.data)
        setOffset(newOffset + result.data.length)
        setTotal(result.total)
        setHasMore((newOffset + result.data.length) < result.total)
      } else {
        setAllContributions([...allContributions, ...result.data])
        setOffset(newOffset + result.data.length)
        setHasMore((newOffset + result.data.length) < result.total)
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching contributions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contributions')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    fetchContributions(offset)
  }

  // Filter tabs configuration
  const filterTabs: Array<{ key: FilterTab; label: string; icon?: React.ReactNode }> = [
    { key: 'all', label: 'All' },
    { key: 'lobbies', label: 'Lobbies', icon: <ThumbsUp className="w-4 h-4" /> },
    { key: 'comments', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'shares', label: 'Shares', icon: <Share2 className="w-4 h-4" /> },
    { key: 'other', label: 'Other', icon: <Award className="w-4 h-4" /> },
  ]

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-violet-600 mt-1">
                {stats.totalContributions}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        <div className="bg-lime-50 rounded-lg p-4 border border-lime-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-lime-600 mt-1">
                {stats.totalPoints}
              </p>
            </div>
            <Award className="w-8 h-8 text-lime-400" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campaigns Participated</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.campaignsParticipated}
              </p>
            </div>
            <Filter className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              activeFilter === tab.key
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {contributions.length === 0 && !error && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {activeFilter === 'all'
              ? 'No contributions yet. Start participating in campaigns!'
              : `No ${activeFilter} found in your contribution history.`}
          </p>
        </div>
      )}

      {/* Contributions List */}
      <div className="space-y-3">
        {contributions.map((contribution) => (
          <div
            key={contribution.id}
            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-violet-300 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getEventIcon(contribution.eventType)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">
                {contribution.description}
              </p>
              <Link
                href={`/campaigns/${contribution.campaignSlug}`}
                className="text-sm text-violet-600 hover:text-violet-700 truncate block mt-1"
              >
                {contribution.campaignName}
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                {formatRelativeTime(contribution.createdAt)}
              </p>
            </div>

            {/* Points Badge */}
            <div className="flex-shrink-0 text-right">
              <div className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-sm font-semibold">
                +{contribution.points}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && contributions.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="default"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
