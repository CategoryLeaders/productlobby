'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  UserPlus,
  CheckCircle,
  Zap,
  Activity,
  Loader2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

interface ContributionUser {
  id: string
  displayName: string
  handle?: string
  avatar?: string
}

interface ActivityEvent {
  id: string
  eventType: string
  description: string
  iconType: string
  user: ContributionUser
  createdAt: string
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  campaignId: string
  className?: string
}

interface FeedState {
  events: ActivityEvent[]
  loading: boolean
  error: string | null
  hasMore: boolean
  offset: number
  autoRefresh: boolean
  selectedFilter: string
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case 'LOBBY':
      return ThumbsUp
    case 'COMMENT':
      return MessageSquare
    case 'SOCIAL_SHARE':
      return Share2
    case 'BRAND_OUTREACH':
      return Send
    case 'SUPPORTER_JOINED':
      return UserPlus
    case 'STATUS_CHANGE':
      return CheckCircle
    case 'MILESTONE':
      return Zap
    default:
      return Activity
  }
}

const getTypeColor = (iconType: string) => {
  switch (iconType) {
    case 'LOBBY':
      return 'bg-violet-600'
    case 'COMMENT':
      return 'bg-blue-500'
    case 'SOCIAL_SHARE':
      return 'bg-orange-500'
    case 'BRAND_OUTREACH':
      return 'bg-green-500'
    case 'SUPPORTER_JOINED':
      return 'bg-pink-500'
    case 'STATUS_CHANGE':
      return 'bg-emerald-500'
    case 'MILESTONE':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

const getTypeBgColor = (iconType: string) => {
  switch (iconType) {
    case 'LOBBY':
      return 'bg-violet-50'
    case 'COMMENT':
      return 'bg-blue-50'
    case 'SOCIAL_SHARE':
      return 'bg-orange-50'
    case 'BRAND_OUTREACH':
      return 'bg-green-50'
    case 'SUPPORTER_JOINED':
      return 'bg-pink-50'
    case 'STATUS_CHANGE':
      return 'bg-emerald-50'
    case 'MILESTONE':
      return 'bg-yellow-50'
    default:
      return 'bg-gray-50'
  }
}

const getTypeTextColor = (iconType: string) => {
  switch (iconType) {
    case 'LOBBY':
      return 'text-violet-700'
    case 'COMMENT':
      return 'text-blue-700'
    case 'SOCIAL_SHARE':
      return 'text-orange-700'
    case 'BRAND_OUTREACH':
      return 'text-green-700'
    case 'SUPPORTER_JOINED':
      return 'text-pink-700'
    case 'STATUS_CHANGE':
      return 'text-emerald-700'
    case 'MILESTONE':
      return 'text-yellow-700'
    default:
      return 'text-gray-700'
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (displayName: string): string => {
  return displayName
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// ============================================================================
// COMPONENTS
// ============================================================================

const EventSkeleton = () => (
  <div className="flex gap-4 pb-6">
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    </div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
    </div>
  </div>
)

const EmptyState = () => (
  <div className="text-center py-12">
    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-700 mb-2">No activity yet</h3>
    <p className="text-gray-500 text-sm">Campaign activity will appear here as supporters engage</p>
  </div>
)

// Filter button component
const FilterButton = ({
  label,
  value,
  selected,
  onClick,
}: {
  label: string
  value: string
  selected: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      selected
        ? 'bg-violet-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    )}
  >
    {label}
  </button>
)

// Event item component
const EventItem = ({ event }: { event: ActivityEvent }) => {
  const IconComponent = getIconComponent(event.iconType)

  return (
    <div className="flex gap-4 pb-6 items-start">
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            getTypeColor(event.iconType)
          )}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Avatar
                src={event.user.avatar}
                initials={getInitials(event.user.displayName)}
                size="sm"
                className="flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {event.user.displayName}
                </p>
                {event.user.handle && (
                  <p className="text-xs text-gray-500">@{event.user.handle}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{event.description}</p>
            <p className="text-xs text-gray-500">{formatRelativeTime(event.createdAt)}</p>
          </div>
        </div>

        {/* Event metadata badge */}
        {event.metadata?.action && (
          <div
            className={cn(
              'mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium',
              getTypeBgColor(event.iconType),
              getTypeTextColor(event.iconType)
            )}
          >
            {event.metadata.action}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ActivityFeed = ({ campaignId, className }: ActivityFeedProps) => {
  const [state, setState] = useState<FeedState>({
    events: [],
    loading: true,
    error: null,
    hasMore: true,
    offset: 0,
    autoRefresh: false,
    selectedFilter: 'ALL',
  })

  // Fetch events from API
  const fetchEvents = useCallback(
    async (offset: number = 0) => {
      try {
        setState((prev) => ({ ...prev, loading: offset === 0 }))

        const params = new URLSearchParams({
          limit: '20',
          offset: offset.toString(),
        })

        const response = await fetch(
          `/api/campaigns/${campaignId}/activity-feed?${params}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activity')
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          events: offset === 0 ? data.events : [...prev.events, ...data.events],
          hasMore: data.pagination?.hasMore || false,
          error: null,
          loading: false,
        }))
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred'
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
      }
    },
    [campaignId]
  )

  // Initial fetch
  useEffect(() => {
    fetchEvents(0)
  }, [fetchEvents])

  // Auto-refresh interval
  useEffect(() => {
    if (!state.autoRefresh) return

    const interval = setInterval(() => {
      fetchEvents(0)
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [state.autoRefresh, fetchEvents])

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setState((prev) => ({
      ...prev,
      selectedFilter: filter,
      offset: 0,
    }))
    fetchEvents(0)
  }

  // Handle load more
  const handleLoadMore = () => {
    const newOffset = state.offset + 20
    setState((prev) => ({ ...prev, offset: newOffset }))
    fetchEvents(newOffset)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchEvents(0)
  }

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = () => {
    setState((prev) => ({
      ...prev,
      autoRefresh: !prev.autoRefresh,
    }))
  }

  // Filter events based on selected filter
  const filteredEvents =
    state.selectedFilter === 'ALL'
      ? state.events
      : state.events.filter(
          (event) =>
            event.iconType === state.selectedFilter ||
            event.eventType.includes(state.selectedFilter)
        )

  return (
    <div className={cn('w-full', className)}>
      {/* Header with controls */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={state.loading}
              title="Refresh activity"
            >
              <RefreshCw
                className={cn(
                  'w-4 h-4',
                  state.loading && 'animate-spin'
                )}
              />
            </Button>
            <Button
              variant={state.autoRefresh ? 'primary' : 'ghost'}
              size="sm"
              onClick={handleAutoRefreshToggle}
              title="Toggle auto-refresh"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            value="ALL"
            selected={state.selectedFilter === 'ALL'}
            onClick={() => handleFilterChange('ALL')}
          />
          <FilterButton
            label="Votes"
            value="LOBBY"
            selected={state.selectedFilter === 'LOBBY'}
            onClick={() => handleFilterChange('LOBBY')}
          />
          <FilterButton
            label="Comments"
            value="COMMENT"
            selected={state.selectedFilter === 'COMMENT'}
            onClick={() => handleFilterChange('COMMENT')}
          />
          <FilterButton
            label="Shares"
            value="SOCIAL_SHARE"
            selected={state.selectedFilter === 'SOCIAL_SHARE'}
            onClick={() => handleFilterChange('SOCIAL_SHARE')}
          />
          <FilterButton
            label="Supporters"
            value="SUPPORTER_JOINED"
            selected={state.selectedFilter === 'SUPPORTER_JOINED'}
            onClick={() => handleFilterChange('SUPPORTER_JOINED')}
          />
          <FilterButton
            label="Status"
            value="STATUS_CHANGE"
            selected={state.selectedFilter === 'STATUS_CHANGE'}
            onClick={() => handleFilterChange('STATUS_CHANGE')}
          />
          <FilterButton
            label="Milestones"
            value="MILESTONE"
            selected={state.selectedFilter === 'MILESTONE'}
            onClick={() => handleFilterChange('MILESTONE')}
          />
        </div>
      </div>

      {/* Error state */}
      {state.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Loading state */}
      {state.loading && state.events.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <EventSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!state.loading && filteredEvents.length === 0 && <EmptyState />}

      {/* Events list */}
      {filteredEvents.length > 0 && (
        <div className="space-y-0">
          {filteredEvents.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Load more button */}
      {state.hasMore && filteredEvents.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={state.loading}
            variant="outline"
            className="gap-2"
          >
            {state.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
